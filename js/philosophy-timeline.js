/**
 * 西方哲学史时间线 - 主程序脚本
 * 负责：数据过滤、DOM 操作、交互逻辑
 */

// ==========================================
// 核心数据管理
// ==========================================

class PhilosophyTimeline {
    constructor() {
        // 确保数据已加载
        this.allData = window.philosophyData && window.philosophyData.length > 0 
            ? window.philosophyData 
            : [];
        this.currentFilter = 'all';
        
        // 创建 ID -> 对象映射，用于快速查询数据
        this.dataMap = this.createDataMap();
        
        // 调试信息
        if (this.allData.length === 0) {
            console.error('❌ 错误：philosophyData 未正确加载');
            console.log('window.philosophyData:', window.philosophyData);
        } else {
            console.log(`✓ 成功加载 ${this.allData.length} 条数据`);
            console.log(`✓ 数据映射包含 ${Object.keys(this.dataMap).length} 个条目`);
        }
        
        this.init();
    }

    // 创建 ID -> 对象的映射
    createDataMap() {
        const map = {};
        this.allData.forEach(item => {
            if (item.id) {
                map[item.id] = item;
            }
        });
        return map;
    }

    buildLengthMap() {
        const yearHeightMap = {}; // { year: height }
        
        // 遍历所有数据
        this.allData.forEach(item => {
            const year = item.year || 0;
            
            // 根据类型确定高度
            let blockHeight = 0;
            if (item.type === 'school') {
                blockHeight = 200;
            } else if (item.type === 'person') {
                blockHeight = 250;
            }
            
            // 如果该年已有记录，取最大值
            if (yearHeightMap[year]) {
                yearHeightMap[year] = Math.max(yearHeightMap[year], blockHeight);
            } else {
                yearHeightMap[year] = blockHeight;
            }
        });
        
        // 转换为按year排序的list: [{year, height}, ...]
        const sortedList = Object.entries(yearHeightMap)
            .map(([year, height]) => ({ year: parseInt(year), height }))
            .sort((a, b) => a.year - b.year);
        
        return sortedList;
    }

    // 构建流派数据结构：获取按时间排序的流派，每个流派包含按时间排序的哲学家ID
    buildSchoolStructure() {
        // 获取所有流派并按年份排序
        const schools = this.allData
            .filter(item => item.type === 'school')
            .sort((a, b) => (a.year || 0) - (b.year || 0));

        // 为每个流派添加按时间排序的哲学家
        const schoolsWithPhilosophers = schools.map(school => {
            // 获取属于该流派的哲学家
            const philosophers = this.allData
                .filter(item => item.type === 'person' && item.school === school.id)
                .sort((a, b) => (a.year || 0) - (b.year || 0));

            return {
                ...school,
                philosopherIds: philosophers.map(p => p.id),
                philosophers: philosophers
            };
        });

        return schoolsWithPhilosophers;
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.render();
    }

    // 缓存 DOM 元素
    cacheDOM() {
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.timelineContent = document.getElementById('timeline-content');
        this.emptyState = document.getElementById('empty-state');
    }

    // 绑定事件监听器
    bindEvents() {
        // 过滤按钮事件
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(btn.dataset.filter);
            });
        });

        // 卡片点击展开/折叠
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.timeline-card');
            if (card) {
                card.classList.toggle('expanded');
            }
        });
    }

    // 设置过滤条件
    setFilter(filterType) {
        this.currentFilter = filterType;

        // 更新按钮状态
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filterType);
        });

        // 重新渲染
        this.render();
    }

    // 获取过滤后的数据
    getFilteredData() {
        let data = this.currentFilter === 'all' 
            ? this.allData 
            : this.allData.filter(item => item.type === this.currentFilter);
        
        // 按 year 排序
        return data.sort((a, b) => {
            const yearA = a.year || 0;
            const yearB = b.year || 0;
            return yearA - yearB;
        });
    }

    // 计算流派的时间范围
    calculateSchoolTimeRange(school) {
        let minYear = school.year || 0;
        let maxYear = school.year || 0;

        if (school.philosophers && school.philosophers.length > 0) {
            school.philosophers.forEach(philosopher => {
                const year = philosopher.year || 0;
                minYear = Math.min(minYear, year);
                maxYear = Math.max(maxYear, year);
            });
        }

        return { minYear, maxYear };
    }

    getYForYear(year, yearHeightMap) {
        let yPosition = 0;
        for (let i = 0; i < yearHeightMap.length; i++) {
            const entry = yearHeightMap[i];
            if (entry.year < year) {
                yPosition += entry.height; // 20是年份间隔
            } else {
                break;
            }
        }
        return yPosition;
    }

    calculateTimeLengthY(timeRange, yearHeightMap) {
        return {minY: this.getYForYear(timeRange.minYear, yearHeightMap), maxY: this.getYForYear(timeRange.maxYear + 1, yearHeightMap)};
    }

    // 检测两个时间范围是否重叠
    timeRangesOverlap(range1, range2) {
        return range1.maxYear >= range2.minYear && range2.maxYear >= range1.minYear;
    }

    // 计算学派的水平和纵向位置（基于时间重叠）
    calculateSchoolPositions(schools) {
        const yearHeightMap = this.buildLengthMap();
        const positions = {}; // { schoolId: { left, top } }
        const blockWidth = 30; // 百分比
        const gapX = 2; // 水平间隔百分比
        const columns = []; // 用于存储每列的最后位置

        // 按时间排序处理每个流派
        schools.forEach((school, index) => {
            const timeRange = this.calculateSchoolTimeRange(school);
            const YRange = this.calculateTimeLengthY(timeRange, yearHeightMap);
            let columnIndex = 0;

            // 检查与之前的流派的时间重叠情况
            let foundColumn = false;
            for (let i = 0; i < columns.length; i++) {
                const column = columns[i];
                foundColumn = true;
                for (let j = 0; j < column.length; j++) {
                    const { YRange: prevRange } = column[j];
                    
                    if (!(YRange.minY >= prevRange.maxY || YRange.maxY <= prevRange.minY)) {
                        foundColumn = false;
                        break;
                    }
                }
                if (foundColumn) {
                    columnIndex = i;
                    break;
                }
            }
            if (!foundColumn) {
                columnIndex = columns.length;
                const newColumn = [];
                newColumn.push({ YRange });
                columns.push(newColumn);
            } else {
                columns[columnIndex].push({ YRange });
            }

            // 计算最终位置
            const leftPosition = columnIndex * (blockWidth + gapX);
            const topPosition = YRange.minY;
            
            positions[school.id] = {
                left: leftPosition,
                top: topPosition
            };
        });

        return positions;
    }

    // 渲染时间轴
    render() {
        // 获取流派结构（包含按时间排序的哲学家）
        const schoolsWithPhilosophers = this.buildSchoolStructure();

        if (schoolsWithPhilosophers.length === 0) {
            this.timelineContent.innerHTML = '';
            this.emptyState.style.display = 'block';
            return;
        }

        this.emptyState.style.display = 'none';
        
        // 计算每个流派的位置（基于时间重叠）
        const schoolPositions = this.calculateSchoolPositions(schoolsWithPhilosophers);
        
        // 计算容器的最大高度
        let maxHeight = 0;
        Object.values(schoolPositions).forEach(pos => {
            maxHeight = Math.max(maxHeight, pos.top + 500); // 500是估算的块高度
        });
        
        // 为timeline-content设置位置为relative，以支持绝对定位的子元素
        if (this.timelineContent.style.position !== 'relative') {
            this.timelineContent.style.position = 'relative';
            this.timelineContent.style.minHeight = Math.max(maxHeight, 1000) + 'px';
        }
        
        // 遍历每个流派，显示流派信息和其哲学家（作为一个整体）
        this.timelineContent.innerHTML = schoolsWithPhilosophers
            .map((school, schoolIndex) => {
                const position = schoolPositions[school.id];
                
                // 创建流派块容器（包含流派和哲学家），使用绝对定位
                let html = `<div class="school-block" style="left: ${position.left}%; top: ${position.top}px;">`;
                
                // 流派标题
                html += this.createTimelineItem(school, schoolIndex);
                
                // 流派内的哲学家
                if (school.philosophers && school.philosophers.length > 0) {
                    const philosophersHtml = school.philosophers
                        .map((philosopher, philIndex) => {
                            // 全局索引用于样式
                            const globalIndex = schoolIndex + philIndex;
                            return this.createTimelineItem(philosopher, globalIndex, true);
                        })
                        .join('');
                    
                    html += philosophersHtml;
                }
                
                html += '</div>'; // 关闭 school-block
                
                return html;
            })
            .join('');
    }

    // 创建单个时间轴项目
    createTimelineItem(item, index, isPhilosopherUnderSchool = false) {
        const typeClass = `type-${item.type}`;
        const icon = this.getIconByType(item.type);
        const indentClass = isPhilosopherUnderSchool ? 'philosopher-under-school' : '';

        return `
            <div class="timeline-item ${indentClass}">
                <div class="timeline-year">${item.displayYear}</div>
                <div class="timeline-dot ${typeClass}">${icon}</div>
                <div class="timeline-card ${typeClass}">
                    <div class="card-header">
                        <div class="card-label">${this.getLabelByType(item.type, item.school)}</div>
                        <h3 class="card-title">${item.title}</h3>
                        <p class="card-subtitle">${item.subtitle}</p>
                        ${item.birthDeath ? `<div class="card-meta">⏳ ${item.birthDeath}</div>` : ''}
                        <p class="card-summary">${item.summary}</p>
                        <div class="card-toggle">⌄</div>
                    </div>
                    <div class="card-details">
                        <div class="card-details-content">
                            ${this.formatDetails(item.details)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 根据类型获取图标
    getIconByType(type) {
        const icons = {
            'school': '🎓',
            'person': '👤',
            'book': '📖'
        };
        return icons[type] || 'ℹ️';
    }

    // 根据类型获取标签
    getLabelByType(type, schoolId) {
        const typeLabels = {
            'school': '哲学流派',
            'person': '代表人物',
            'book': '主要著作'
        };
        
        // 如果是人物且提供了 schoolId，从数据源获取学派名称
        if (type === 'person' && schoolId && this.dataMap[schoolId]) {
            const schoolObj = this.dataMap[schoolId];
            return schoolObj.title;
        }
        
        return typeLabels[type] || '其他';
    }

    // 格式化详情文本（处理换行和特殊格式）
    formatDetails(text) {
        if (!text) return '';
        // 转义 HTML 特殊字符
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// ==========================================
// 初始化应用
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const timeline = new PhilosophyTimeline();
    console.log('✓ 西方哲学史时间线已加载');
});
