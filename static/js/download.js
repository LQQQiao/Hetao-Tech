// 下载功能实现
function generateNewsImage() {
    // 获取当前所有文章
    const articles = Array.from(document.querySelectorAll('.article-card')).map(card => {
        return {
            title: card.querySelector('.article-title').textContent,
            summary: card.querySelector('.article-summary').textContent,
            date: card.querySelector('.article-date').textContent
        };
    });

    // 筛选最近7天的文章
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentArticles = articles.filter(article => {
        const articleDate = new Date(article.date);
        return articleDate >= sevenDaysAgo;
    }).slice(0, 15); // 最多取15条

    // 创建canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 设置画布尺寸（适配手机屏幕）
    canvas.width = 750; // 标准手机屏幕宽度
    
    // 计算所需高度
    const lineHeight = 28; // 减小行高
    const titleMargin = 12; // 减少标题间距
    const articleMargin = 20; // 减少文章间距
    const contentPadding = 40; // 内容区域的内边距
    let totalHeight = 150; // 增加顶部留白

    recentArticles.forEach((article, index) => {
        totalHeight += titleMargin; // 标题上方间距
        totalHeight += lineHeight * Math.ceil(article.title.length * 24 / (canvas.width - 120)); // 标题高度
        totalHeight += lineHeight * Math.ceil(article.summary.length * 16 / (canvas.width - 120)) + articleMargin; // 正文高度
    });

    canvas.height = totalHeight + 50; // 减少底部留白

    // 设置背景
    ctx.fillStyle = '#F5F5F7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 60);
    gradient.addColorStop(0, '#0052CC');
    gradient.addColorStop(1, '#007AFF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 60);

    // 绘制主要内容区域的白色背景和阴影
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, 20, 70, canvas.width - 40, canvas.height - 90, 16);
    ctx.restore();

    // 设置文字样式
    ctx.textBaseline = 'top';
    let y = 20;

    // 绘制标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, "SF Pro Text"';
    const titleText = '河套应用创新技术资讯';
    const titleWidth = ctx.measureText(titleText).width;
    ctx.fillText(titleText, (canvas.width - titleWidth) / 2, y);
    y += 40;

    // 绘制日期
    const now = new Date();
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const dateStr = now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日 ' + days[now.getDay()];
    ctx.font = '14px -apple-system';
    const dateWidth = ctx.measureText(dateStr).width;
    ctx.fillText(dateStr, (canvas.width - dateWidth) / 2, y);
    y += 60;

    // 绘制文章
    let contentY = y;
    recentArticles.forEach((article, index) => {
        // 绘制序号和标题
        ctx.font = 'bold 24px -apple-system';
        ctx.fillStyle = '#007AFF';
        const numberText = `${index + 1}. `;
        const numberWidth = ctx.measureText(numberText).width;
        ctx.fillText(numberText, 40, contentY);

        // 绘制标题（紧跟序号）
        const titleLines = wrapText(ctx, article.title, canvas.width - 120, 24);
        titleLines.forEach((line, i) => {
            if (i === 0) {
                ctx.fillText(line, 40 + numberWidth, contentY);
            } else {
                ctx.fillText(line, 40, contentY + i * lineHeight);
            }
        });

        const titleHeight = titleLines.length * lineHeight;
        contentY += titleHeight + titleMargin;

        // 绘制正文
        ctx.font = '16px -apple-system';
        ctx.fillStyle = '#86868B';
        const summaryLines = wrapText(ctx, article.summary, canvas.width - 80, 16);
        summaryLines.forEach((line, i) => {
            ctx.fillText(line, 40, contentY + i * lineHeight);
        });

        contentY += summaryLines.length * lineHeight + articleMargin;
    });

    // 转换为图片并下载
    const link = document.createElement('a');
    link.download = `河套技术资讯_${new Date().toLocaleDateString()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// 文本换行处理
function wrapText(ctx, text, maxWidth, fontSize) {
    const words = text.split('');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        const width = ctx.measureText(currentLine + word).width;
        if (width < maxWidth) {
            currentLine += word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    });
    lines.push(currentLine);

    return lines;
}

// 绑定下载按钮事件
document.getElementById('downloadBtn').addEventListener('click', generateNewsImage);

// 添加圆角矩形绘制函数
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}