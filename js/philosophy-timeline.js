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
        
        // 调试信息
        if (this.allData.length === 0) {
            console.error('❌ 错误：philosophyData 未正确加载');
            console.log('window.philosophyData:', window.philosophyData);
        } else {
            console.log(`✓ 成功加载 ${this.allData.length} 条数据`);
        }
        
        this.init();
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
        if (this.currentFilter === 'all') {
            return this.allData;
        }
        return this.allData.filter(item => item.type === this.currentFilter);
    }

    // 渲染时间轴
    render() {
        const filteredData = this.getFilteredData();

        if (filteredData.length === 0) {
            this.timelineContent.innerHTML = '';
            this.emptyState.style.display = 'block';
            return;
        }

        this.emptyState.style.display = 'none';
        this.timelineContent.innerHTML = filteredData
            .map((item, index) => this.createTimelineItem(item, index))
            .join('');
    }

    // 创建单个时间轴项目
    createTimelineItem(item, index) {
        const typeClass = `type-${item.type}`;
        const icon = this.getIconByType(item.type);
        const isLast = index === this.getFilteredData().length - 1;

        return `
            <div class="timeline-item">
                <div class="timeline-year">${item.displayYear}</div>
                <div class="timeline-dot ${typeClass}">${icon}</div>
                <div class="timeline-card ${typeClass}">
                    <div class="card-header">
                        <div class="card-label">${this.getLabelByType(item.type)}</div>
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
    getLabelByType(type) {
        const labels = {
            'school': '哲学流派',
            'person': '代表人物',
            'book': '主要著作'
        };
        return labels[type] || '其他';
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
