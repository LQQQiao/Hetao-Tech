from flask import Flask, render_template, jsonify, redirect
from config import Config
import requests
import jwt
import time
from datetime import datetime
import pytz

app = Flask(__name__)
app.config.from_object(Config)

def get_tenant_access_token():
    """获取飞书tenant_access_token"""
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    payload = {
        "app_id": app.config['FEISHU_APP_ID'],
        "app_secret": app.config['FEISHU_APP_SECRET']
    }
    headers = {"Content-Type": "application/json"}
    response = requests.post(url, json=payload, headers=headers)
    return response.json().get("tenant_access_token")

def get_articles():
    """从飞书多维表格获取文章数据"""
    token = get_tenant_access_token()
    url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{app.config['BASE_ID']}/tables/{app.config['TABLE_ID']}/records"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        articles = []
        for item in data.get('data', {}).get('items', []):
            fields = item.get('fields', {})
            link = fields.get('链接', '')
            # 确保链接字段是字符串格式
            if isinstance(link, dict):
                link = link.get('text', '') or link.get('link', '')
            # 处理时间字段
            date = fields.get('时间', '')
            if isinstance(date, int):
                # 使用pytz处理时区转换
                tz = pytz.timezone('Asia/Shanghai')
                date = datetime.fromtimestamp(date/1000).replace(tzinfo=pytz.UTC)
                date = date.astimezone(tz).strftime('%Y-%m-%d')
            articles.append({
                'title': fields.get('标题', ''),
                'summary': fields.get('总结摘要', ''),
                'content': fields.get('读取全文', ''),
                'link': link,
                'date': date
            })
        # 对文章列表进行倒序排序
        articles.reverse()
        return articles
    app.logger.error(f"获取文章数据失败: {response.status_code} - {response.text}")
    return []

@app.route('/')
def index():
    """首页路由"""
    articles = get_articles()
    return render_template('index.html', articles=articles)

@app.route('/article/<int:index>')
def article(index):
    """文章详情页路由 - 直接跳转到飞书链接"""
    try:
        app.logger.info(f"访问文章详情页: index={index}")
        articles = get_articles()
        app.logger.info(f"获取到文章列表，总数: {len(articles)}")
        
        if not articles:
            app.logger.error("未能获取到文章列表")
            return '获取文章列表失败', 500
            
        if 0 <= index < len(articles):
            article = articles[index]
            app.logger.info(f"找到文章: {article.get('title')}")
            
            if not article.get('link'):
                app.logger.warning(f"文章链接为空: index={index}")
                return '文章链接不存在', 404
                
            url = article.get('link')
            if not url:
                app.logger.warning(f"文章链接格式无效")
                return '文章链接格式无效', 404
                
            app.logger.info(f"重定向到链接: {url}")
            return redirect(url)
        
        app.logger.error(f"文章索引越界: {index}, 文章总数: {len(articles)}")
        return '文章不存在', 404
    except Exception as e:
        app.logger.error(f"访问文章详情页出错: {str(e)}")
        return '服务器内部错误', 500

@app.route('/refresh')
def refresh():
    """手动刷新数据缓存"""
    cache.delete('articles')
    return redirect('/')

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)