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
        
        // School mapping
        const schoolNames = {
            'school-milesian': '米利都学派',
            'school-pythagorean': '毕达哥拉斯学派',
            'school-ionian': '爱奥尼亚学派',
            'school-eleatic': '爱利亚学派',
            'school-sophist': '诡辩学派',
            'school-atomism': '原子论',
            'school-stoicism': '斯多葛派',
            'school-epicureanism': '伊壁鸠鲁学派',
            'school-skepticism': '怀疑主义',
            'school-neoplatonism': '新柏拉图主义',
            'school-christian-philosophy': '基督教哲学',
            'school-islamic-philosophy': '伊斯兰哲学',
            'school-jewish-philosophy': '犹太哲学',
            'school-humanism': '人文主义',
            'school-rationalism': '理性主义',
            'school-empiricism': '经验主义',
            'school-enlightenment': '启蒙运动',
            'school-german-idealism': '德国观念论',
            'school-utilitarianism': '功利主义',
            'school-positivism': '实证主义',
            'school-neo-kantianism': '新康德主义',
            'school-analytic-philosophy': '分析哲学',
            'school-pragmatism': '实用主义',
            'school-phenomenology': '现象学',
            'school-hermeneutics': '解释学',
            'school-existentialism': '存在主义',
            'school-philosophy-of-science': '科学哲学',
            'school-logical-positivism': '逻辑实证主义',
            'school-structuralism': '结构主义',
            'school-poststructuralism': '后结构主义',
            'school-deconstructionism': '解构主义',
            'school-frankfurt-school': '法兰克福学派',
            'school-postmodernism': '后现代主义',
            'school-feminism-philosophy': '女性主义哲学',
            'school-environmental-ethics': '环境伦理学',
            'school-queer-theory': '酷儿理论',
            'school-postcolonial-theory': '后殖民理论',
            'school-critical-realism': '批判实在论',
            'school-marxism': '马克思主义',
            'school-platonism': '柏拉图主义',
            'school-aristotelianism': '亚里士多德主义'
        };
        
        // If school id is provided and person type, return school name
        if (schoolId && schoolNames[schoolId]) {
            return schoolNames[schoolId];
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
