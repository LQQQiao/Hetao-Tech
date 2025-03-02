import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

class Config:
    # 飞书应用配置
    FEISHU_APP_ID = os.getenv('FEISHU_APP_ID', 'cli_a737802ccfde501c')
    FEISHU_APP_SECRET = os.getenv('FEISHU_APP_SECRET', 'nUXVjy3tQG1yntwC2m6NLgdjWHvBItT8')
    
    # 多维表格配置
    BASE_ID = os.getenv('BASE_ID', 'BgJAbUiInakleysUv9IcbCn2n0f')
    TABLE_ID = os.getenv('TABLE_ID', 'tbl0T6bzLy1H3cuH')
    
    # Flask配置
    SECRET_KEY = os.urandom(24)
    CACHE_TYPE = 'simple'
    CACHE_DEFAULT_TIMEOUT = 300