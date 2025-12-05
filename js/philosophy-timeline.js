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
        this.schoolsWithPhilosophers = this.buildSchoolStructure();
        this.schoolMap = {};
        for (const item of this.schoolsWithPhilosophers) {
            this.schoolMap[item.id] = item;
        }
        
        // 创建 ID -> 对象映射，用于快速查询数据
        this.dataMap = this.createDataMap();
        this.minYear = Math.min(...this.allData.map(item => item.year || Infinity));
        this.maxYear = Math.max(...this.allData.map(item => item.year || -Infinity));
        
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

    // 构建按100年分段的布局
    buildSegmentedLayout(schools) {
        const SEGMENT_YEARS = 100;
        
        // 计算时间范围
        let minYear = Infinity, maxYear = -Infinity;
        schools.forEach(school => {
            minYear = Math.min(minYear, school.year || 0);
            maxYear = Math.max(maxYear, school.year || 0);
            
            if (school.philosophers && school.philosophers.length > 0) {
                school.philosophers.forEach(p => {
                    maxYear = Math.max(maxYear, p.year || 0);
                });
            }
        });
        
        // 计算起始和结束的100年段
        const startSegment = Math.floor(minYear / SEGMENT_YEARS) * SEGMENT_YEARS;
        const endSegment = Math.ceil((maxYear + 1) / SEGMENT_YEARS) * SEGMENT_YEARS;
        
        // 创建段
        const segments = [];
        for (let year = startSegment; year < endSegment; year += SEGMENT_YEARS) {
            segments.push({
                startYear: year,
                endYear: year + SEGMENT_YEARS,
                schools: [],
                maxElementCount: 0,
                segmentHeight: 0
            });
        }
        
        // 将流派分配到各段，计算每段内的流派数和最大元素数
        const schoolFirstSegment = {}; // schoolId -> 第一次出现的 segmentIndex
        
        schools.forEach(school => {
            // 计算该流派涵盖的所有段
            const schoolMinYear = school.year || 0;
            let schoolMaxYear = school.year || 0;
            
            if (school.philosophers && school.philosophers.length > 0) {
                schoolMaxYear = Math.max(...school.philosophers.map(p => p.year || 0));
            }
            
            segments.forEach((segment, segmentIndex) => {
                // 检查流派是否与该段时间重叠
                if (schoolMaxYear >= segment.startYear && schoolMinYear < segment.endYear) {
                    if (schoolFirstSegment[school.id] === undefined) {
                        schoolFirstSegment[school.id] = segmentIndex;
                    }
                    segment.schools.push(school);
                    
                    // 计算该流派在该段内的元素数（流派+其哲学家）
                    let elementCount = 1; // 流派本身
                    if (school.philosophers) {
                        school.philosophers.forEach(philosopher => {
                            if ((philosopher.year || 0) >= segment.startYear && (philosopher.year || 0) < segment.endYear) {
                                elementCount++;
                            }
                        });
                    }
                    
                    segment.maxElementCount = Math.max(segment.maxElementCount, elementCount);
                }
            });
        });
        
        // 为每个流派计算全局列索引（基于其在首次出现segment中的位置）
        const schoolColumnIndex = {}; // schoolId -> 全局列索引
        segments.forEach((segment, segmentIndex) => {
            segment.schools.forEach((school, positionInSegment) => {
                if (schoolFirstSegment[school.id] === segmentIndex) {
                    schoolColumnIndex[school.id] = positionInSegment;
                }
            });
        });
        
        // 计算每段的高度（基于最大元素数）
        const elementHeight = 120; // 每个元素的高度
        segments.forEach(segment => {
            segment.segmentHeight = segment.maxElementCount * elementHeight + 40; // 加padding
            segment.columns = segment.schools.length; // 列数等于该段的流派数
        });
        
        console.log('Segments:', segments.map(s => ({ startYear: s.startYear, schools: s.schools.length, columns: s.columns })));
        console.log('School Column Index:', schoolColumnIndex);
        
        return { segments, minYear, maxYear, startSegment, endSegment, schoolFirstSegment, schoolColumnIndex };
    }

    // 为分段布局中的每个流派计算位置
    calculateSegmentedPositions(schools, segmentedLayout) {
        const { segments } = segmentedLayout;
        const positions = {}; // { schoolId: { segment, column, offsetY } }
        
        segments.forEach((segment, segmentIndex) => {
            let columnX = 0;
            
            segment.schools.forEach(school => {
                const elementHeight = 120;
                let offsetY = 0;
                
                // 该流派在该段内的元素列表
                const elementsInSegment = [school]; // 先加流派本身
                if (school.philosophers) {
                    school.philosophers.forEach(philosopher => {
                        if (philosopher.year >= segment.startYear && philosopher.year < segment.endYear) {
                            elementsInSegment.push(philosopher);
                        }
                    });
                }
                
                if (!positions[school.id]) {
                    positions[school.id] = {
                        segment: segmentIndex,
                        column: columnX,
                        children: {} // { philosopherId: offsetY }
                    };
                }
                
                // 计算该流派在该段内的位置
                offsetY = 0;
                let isFirst = true;
                elementsInSegment.forEach((elem, elemIndex) => {
                    if (elem.type === 'school') {
                        positions[school.id].offsetY = offsetY;
                    } else {
                        // 是哲学家
                        if (!positions[school.id].children) {
                            positions[school.id].children = {};
                        }
                        positions[school.id].children[elem.id] = offsetY;
                    }
                    offsetY += elementHeight;
                });
                
                columnX++;
            });
        });
        
        return positions;
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

    // 渲染时间轴
    render() {
        const schools = this.schoolsWithPhilosophers;

        if (schools.length === 0) {
            this.timelineContent.innerHTML = '';
            this.emptyState.style.display = 'block';
            return;
        }

        this.emptyState.style.display = 'none';
        
        // 构建按100年分段的布局
        const segmentedLayout = this.buildSegmentedLayout(schools);
        const { segments, schoolFirstSegment, schoolColumnIndex } = segmentedLayout;
        const visibleSegments = segments
            .map((segment, index) => ({ ...segment, originalIndex: index }))
            .filter(segment => segment.schools.length > 0);
        
        // 计算位置
        const positions = this.calculateSegmentedPositions(schools, segmentedLayout);
        
        // 计算总高度
        let totalHeight = Math.max(...segments.map(s => s.segmentHeight));
        
        // 设置容器属性为竖向
        this.timelineContent.style.position = 'relative';
        this.timelineContent.style.minHeight = 'auto';
        this.timelineContent.style.display = 'flex';
        this.timelineContent.style.flexDirection = 'column';
        this.timelineContent.style.gap = '2rem';
        this.timelineContent.style.padding = '2rem';
        
        // 为每个段创建一个容器
        let html = '';
        
        visibleSegments.forEach((segment, segmentIndex) => {
            // 段容器
            html += `<div class="timeline-segment" style="
                width: 100%;
                min-height: ${segment.segmentHeight}px;
                border-top: 2px solid #e5e7eb;
                padding-top: 2.5rem;
                position: relative;
                display: flex;
                gap: 1.5rem;
                flex-wrap: nowrap;
                align-items: flex-start;
            ">`;
            
            // 段标题（绝对定位，不占用flex空间）
            html += `<div class="segment-label" style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                font-size: 0.875rem;
                color: #4b5563;
                font-weight: 700;
                margin-bottom: 0.5rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            ">${segment.startYear} - ${segment.endYear - 1}</div>`;
            
            // 计算该segment中最大的order值（需要的总列数）
            let maxOrder = -1;
            segment.schools.forEach(school => {
                if (schoolColumnIndex[school.id] !== undefined) {
                    maxOrder = Math.max(maxOrder, schoolColumnIndex[school.id]);
                }
            });
            const totalColumnsNeeded = maxOrder + 1;
            
            // 为每一列创建占位符或流派块
            for (let colIndex = 0; colIndex < totalColumnsNeeded; colIndex++) {
                const schoolsInThisColumn = segment.schools.filter(school => 
                    schoolColumnIndex[school.id] === colIndex
                );
                
                if (schoolsInThisColumn.length > 0) {
                    // 该列有流派，渲染流派块
                    schoolsInThisColumn.forEach((school) => {
                        const isFirstAppearance = schoolFirstSegment[school.id] === segment.originalIndex;
                        const philosophersInSegment = school.philosophers.filter(phil => 
                            phil.year >= segment.startYear && phil.year < segment.endYear);

                        if (isFirstAppearance || philosophersInSegment.length > 0) {
                            // 流派块 - 固定宽度以保持列对齐
                            html += `<div class="school-block" style="
                                flex: 0 0 280px;
                                width: 280px;
                                order: ${schoolColumnIndex[school.id]};
                            ">`;
                            
                            // 仅在首次出现的段渲染流派标题
                            if (isFirstAppearance) {
                                html += this.createTimelineItem(school, segmentIndex, false);
                            }
                            
                            // 该段内的哲学家
                            if (philosophersInSegment.length > 0) {
                                philosophersInSegment.forEach((philosopher, philIndex) => {
                                    html += this.createTimelineItem(philosopher, segmentIndex + philIndex, true);
                                });
                            }
                            
                            html += '</div>'; // 关闭 school-block
                        }else {
                            // 该列无流派，创建空白占位符
                            html += `<div class="school-block empty-placeholder" style="
                                flex: 0 0 280px;
                                width: 280px;
                                min-height: 100px;
                                order: ${colIndex};
                            "></div>`;
                        }
                    });
                } else {
                    // 该列无流派，创建空白占位符
                    html += `<div class="school-block empty-placeholder" style="
                        flex: 0 0 280px;
                        width: 280px;
                        min-height: 100px;
                        order: ${colIndex};
                    "></div>`;
                }
            }
            
            html += '</div>'; // 关闭 timeline-segment
        });
        
        this.timelineContent.innerHTML = html;
    }

    // 创建单个时间轴项目
    createTimelineItem(item, index, isPhilosopherUnderSchool = false, offsetY = null) {
        const typeClass = `type-${item.type}`;
        const icon = this.getIconByType(item.type);
        const indentClass = '';// isPhilosopherUnderSchool ? 'philosopher-under-school' : '';
        
        // 如果提供了偏移Y位置，添加一个占位元素
        const spacerElement = offsetY !== null && offsetY > 0 ? 
            `<div style="height: ${offsetY}px; position: relative;">
                <div style="position: absolute; left: 40px; top: 0; bottom: 0; width: 1px; background: linear-gradient(to bottom, #e5e7eb, #cbd5e1); opacity: 0.4;"></div>
            </div>` : '';

                // <div class="timeline-year">${item.displayYear}</div>
                // <div class="timeline-dot ${typeClass}">${icon}</div>
                // <div class="card-label">${this.getLabelByType(item.type, item.school)}</div>
        return `
            ${spacerElement}
            <div class="timeline-item ${indentClass}">
                <div class="timeline-card ${typeClass}">
                    <div class="card-header">
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
