// 下载功能实现
function generateNewsImage() {
    try {
        // 预加载二维码图片
        const websiteQRImage = new Image();
        const wechatQRImage = new Image();
        
        // 添加错误处理
        websiteQRImage.onerror = () => {
            console.error('网站二维码图片加载失败');
            alert('网站二维码图片加载失败，请检查图片路径');
        };
        
        wechatQRImage.onerror = () => {
            console.error('微信二维码图片加载失败');
            alert('微信二维码图片加载失败，请检查图片路径');
        };
        
        // 设置图片源
        websiteQRImage.src = '/static/images/https___hetao-tech.vercel.app_.png';
        wechatQRImage.src = '/static/images/wechat.png';

        // 等待所有图片加载完成
        Promise.all([
            new Promise((resolve, reject) => {
                if (websiteQRImage.complete) {
                    resolve();
                } else {
                    websiteQRImage.onload = resolve;
                    websiteQRImage.onerror = reject;
                }
            }),
            new Promise((resolve, reject) => {
                if (wechatQRImage.complete) {
                    resolve();
                } else {
                    wechatQRImage.onload = resolve;
                    wechatQRImage.onerror = reject;
                }
            })
        ])
        .then(() => {
            // 继续执行Canvas绘制逻辑
            // 获取当前所有文章
            const articles = [];
            const articleCards = document.querySelectorAll('.article-card');
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            articleCards.forEach(card => {
                const titleElement = card.querySelector('.article-title');
                const summaryElement = card.querySelector('.article-summary');
                const dateElement = card.querySelector('.article-date');
                if (titleElement && summaryElement && dateElement) {
                    const articleDate = new Date(dateElement.textContent.trim());
                    if (articleDate >= sevenDaysAgo) {
                        articles.push({
                            title: titleElement.textContent.trim(),
                            summary: summaryElement.textContent.trim(),
                            date: dateElement.textContent.trim()
                        });
                    }
                }
            });

            // 按日期倒序排序并限制数量
            articles.sort((a, b) => new Date(b.date) - new Date(a.date));
            const limitedArticles = articles.slice(0, 15);

            // 检查是否有文章
            if (!limitedArticles || limitedArticles.length === 0) {
                alert('当前页面没有最近7天内的文章');
                return;
            }

            // 创建canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                alert('您的浏览器不支持Canvas功能，无法生成图片');
                return;
            }

            // 计算文章列表的总高度
            let totalHeight = 0;
            limitedArticles.forEach(article => {
                ctx.font = 'bold 24px -apple-system';
                const titleLines = wrapText(ctx, article.title, 660, 24);
                
                ctx.font = '16px -apple-system';
                const summaryLines = wrapText(ctx, article.summary, 660, 16);
                totalHeight += titleLines.length * 30 + summaryLines.length * 24 + 60;
            });

            // 设置画布尺寸
            canvas.width = 750;
            // 计算所需的最小高度：文章内容高度 + 顶部标题区域(120px) + 二维码区域(200px) + 额外边距(120px)
            const minHeight = totalHeight + 120 + 200 + 120;
            canvas.height = Math.max(minHeight, 800); // 确保最小高度不小于800px

            // 绘制顶部渐变背景
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 320);
            gradient.addColorStop(0, '#0052CC');
            gradient.addColorStop(1, '#007AFF');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, 320);

            // 设置背景色
            ctx.fillStyle = '#F5F5F7';
            ctx.fillRect(0, 320, canvas.width, canvas.height - 320);

            // 绘制标题
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 45px -apple-system';
            const title = '河套应用创新技术资讯';
            const titleWidth = ctx.measureText(title).width;
            ctx.fillText(title, (canvas.width - titleWidth) / 2, 190);

            // 绘制当前时间
            const now = new Date();
            const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${days[now.getDay()]}`;
            ctx.font = '21px -apple-system';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            const dateWidth = ctx.measureText(dateStr).width;
            ctx.fillText(dateStr, (canvas.width - dateWidth) / 2, 220);

            let y = 340; // 修改起始y坐标，确保在蓝色背景区域下方

            // 计算二维码区域所需的高度和位置
            const qrCodeHeight = 200; // 二维码尺寸(120px) + 文字说明 + 边距
            
            // 绘制文章列表背景和阴影（扩展白色背景框范围）
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 2;
            // 确保白色背景框足够大，完整包含所有内容
            roundRect(ctx, 20, 340, canvas.width - 40, totalHeight + qrCodeHeight + 80, 12);
            
            // 重置阴影效果，确保文字不受阴影影响
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            // 重置y坐标
            y = 360; // 调整文章内容起始位置

            // 绘制文章列表 - 优化绘制逻辑
            limitedArticles.forEach((article, index) => {
                // 绘制文章序号
                ctx.font = 'bold 24px -apple-system';
                ctx.fillStyle = '#333333';
                ctx.fillText(`${index + 1}.`, 30, y + 24);

                // 绘制文章标题
                ctx.font = 'bold 27px -apple-system';
                ctx.fillStyle = '#333333';
                const lines = wrapText(ctx, article.title, canvas.width - 90, 27);
                lines.forEach(line => {
                    ctx.fillText(line, 60, y + 27);
                    y += 33;
                });

                // 在标题和摘要之间添加更大的间距
                y += 20;

                // 绘制文章摘要
                ctx.font = '16px -apple-system';
                ctx.fillStyle = '#666666';
                const summaryLines = wrapText(ctx, article.summary, canvas.width - 90, 16);
                
                // 确保所有摘要行都被绘制
                if (summaryLines && summaryLines.length > 0) {
                    summaryLines.forEach(line => {
                        ctx.fillText(line, 60, y);
                        y += 24;
                    });
                }

                // 文章之间的间距
                y += 15;
            });

            // 重置阴影，避免影响二维码
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            
            // 绘制二维码 - 优化绘制逻辑和错误处理
            const qrSize = 120;
            const totalWidth = qrSize * 2 + 60; // 两个二维码加间距的总宽度
            const startX = (canvas.width - totalWidth) / 2; // 居中起始位置
            const qrY = y + 40; // 使用当前y值计算二维码位置，确保在文章内容之后
            
            // 检查图片是否已加载完成
            if (websiteQRImage.complete && websiteQRImage.naturalHeight !== 0) {
                // 绘制左侧二维码（网站）
                ctx.drawImage(websiteQRImage, startX, qrY, qrSize, qrSize);
                ctx.font = '14px -apple-system';
                ctx.fillStyle = '#666666';
                const websiteText = '长按访问网站';
                const websiteTextWidth = ctx.measureText(websiteText).width;
                ctx.fillText(websiteText, startX + (qrSize - websiteTextWidth) / 2, qrY + qrSize + 25);
                
                ctx.font = '12px -apple-system';
                const websiteSubText = '获取更多技术资讯';
                const websiteSubTextWidth = ctx.measureText(websiteSubText).width;
                ctx.fillText(websiteSubText, startX + (qrSize - websiteSubTextWidth) / 2, qrY + qrSize + 45);
            }
            
            // 检查图片是否已加载完成
            if (wechatQRImage.complete && wechatQRImage.naturalHeight !== 0) {
                // 绘制右侧二维码（微信）
                const rightQrX = startX + qrSize + 60;
                ctx.drawImage(wechatQRImage, rightQrX, qrY, qrSize, qrSize);
                ctx.font = '14px -apple-system';
                const wechatText = '长按关注公众号';
                const wechatTextWidth = ctx.measureText(wechatText).width;
                ctx.fillText(wechatText, rightQrX + (qrSize - wechatTextWidth) / 2, qrY + qrSize + 25);
                
                ctx.font = '12px -apple-system';
                const wechatSubText = '了解和联系我们~';
                const wechatSubTextWidth = ctx.measureText(wechatSubText).width;
                ctx.fillText(wechatSubText, rightQrX + (qrSize - wechatSubTextWidth) / 2, qrY + qrSize + 45);
            } else {
                console.error('微信二维码图片未完成加载');
                // 绘制一个占位框
                const rightQrX = startX + qrSize + 60;
                ctx.strokeStyle = '#666666';
                ctx.strokeRect(rightQrX, qrY, qrSize, qrSize);
                ctx.font = '14px -apple-system';
                ctx.fillStyle = '#666666';
                ctx.fillText('二维码加载失败', rightQrX + 10, qrY + qrSize/2);
            }

            // 下载图片
            try {
                const link = document.createElement('a');
                link.download = `河套技术资讯_${new Date().toLocaleDateString()}.png`;
                link.href = canvas.toDataURL('image/png');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error('下载图片时出错:', error);
                alert('下载图片失败，请稍后重试');
            }
        })
        .catch(error => {
            console.error('图片加载失败:', error);
            alert('图片加载失败，请稍后重试');
        });
    } catch (error) {
        console.error('生成图片时出错:', error);
        alert('生成图片失败，请稍后重试');
    }
}

function downloadImage(canvas) {
    try {
        const link = document.createElement('a');
        link.download = `河套技术资讯_${new Date().toLocaleDateString()}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('下载图片时出错:', error);
    }
}

// 文本换行处理 - 优化版本
function wrapText(ctx, text, maxWidth, fontSize) {
    // 使用更精确的字符分割方式
    const words = text.split('');
    const lines = [];
    let currentLine = '';

    // 设置正确的字体大小以确保测量准确
    ctx.font = `${fontSize}px -apple-system`;

    words.forEach(word => {
        const width = ctx.measureText(currentLine + word).width;
        if (width < maxWidth) {
            currentLine += word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    });
    
    // 确保最后一行也被添加
    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}

// 绑定下载按钮事件
window.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            console.log('下载按钮被点击');
            generateNewsImage();
        });
    } else {
        console.error('未找到下载按钮');
    }
});

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