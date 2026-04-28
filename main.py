import json
from typing import Optional
import bcrypt
import re
import os
from openai import OpenAI
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from database import get_db_connection
from models import CartItem, CartUpdate, OrderItem, OrderCreate, UserSignup, UserLogin, OrderStatusUpdate

app = FastAPI()

# --- 정적 파일 마운트 ---
app.mount("/css", StaticFiles(directory="css"), name="css")
app.mount("/js", StaticFiles(directory="js"), name="js")
app.mount("/img", StaticFiles(directory="img"), name="img")
app.mount("/json", StaticFiles(directory="json"), name="json")

# --- 상품 데이터 로드 및 저장 함수 ---
with open("json/data.json", "r", encoding="utf-8") as f:
    db_data = json.load(f)

def save_data():
    with open("json/data.json", "w", encoding="utf-8") as f:
        json.dump(db_data, f, ensure_ascii=False, indent=4)

# --- 페이지 라우팅 ---
@app.get("/")
def read_root(): return FileResponse("index.html")

@app.get("/index.html")
def read_index(): return FileResponse("index.html")

@app.get("/sub.html")
def read_sub(): return FileResponse("sub.html")

@app.get("/cart.html")
def read_cart_page(): return FileResponse("cart.html")

@app.get("/order_list.html")
def read_order_list_page(): return FileResponse("order_list.html")

@app.get("/login.html")
def read_login_page(): return FileResponse("login.html")

@app.get("/admin.html")
def read_admin_page(): return FileResponse("admin.html")

# --- 상품 API ---
@app.get("/api/data")
def get_all_data(): return db_data

@app.get("/api/products")
def get_all_products():
    section_map = {
        "featured": "featured",
        "newItems": "new",
        "collection": "collection",
        "mug": "mug",
        "plate": "plate",
        "tableware": "tableware",
    }
    all_products = []
    for section_key, category in section_map.items():
        items = db_data.get("sections", {}).get(section_key, [])
        for index, item in enumerate(items, start=1):
            product = dict(item)
            safe_name = re.sub(r'\[[^\]]*\]', '', product.get('name', ''))
            safe_name = re.sub(r'[^a-z0-9가-힣]+', '-', safe_name.lower()).strip('-')[:30]
            product['id'] = f"{category}-{index}-{safe_name}"
            all_products.append(product)
    return all_products

@app.post("/api/products")
def add_product(new_product: dict):
    category = new_product.get("category", "featured")
    section_map = {
        "featured": "featured",
        "new": "newItems",
        "collection": "collection",
        "mug": "mug",
        "plate": "plate",
        "tableware": "tableware",
    }
    section_key = section_map.get(category, "featured")
    section_items = db_data.get("sections", {}).get(section_key, [])
    new_id = f"{category}-{len(section_items) + 1}-{new_product.get('name', '')[:10].lower().replace(' ', '-')}"
    new_product["id"] = new_id
    section_items.append(new_product)
    save_data()
    return {"message": "상품 등록 성공", "product": new_product}

@app.delete("/api/products/{product_id}")
def delete_product(product_id: str):
    sections = db_data.get("sections", {})
    for section_key, items in sections.items():
        original_len = len(items)
        sections[section_key] = [p for p in items if p.get("id") != product_id]
        if len(sections[section_key]) < original_len:
            save_data()
            return {"message": "상품 삭제 성공"}
    raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")

# --- 주문 및 장바구니 API ---
@app.get("/api/cart")
def get_cart_items(user_id: str):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM cart WHERE user_id = %s", (user_id,))
            result = cursor.fetchall()
    finally: conn.close()
    return {"cart": result, "total_items": len(result)}

@app.get("/api/orders")
def get_orders(user_id: Optional[str] = None):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if user_id and user_id not in ["undefined", "null", ""]:
                cursor.execute("SELECT * FROM orders WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
            else:
                cursor.execute("SELECT * FROM orders ORDER BY created_at DESC")
            orders = cursor.fetchall()
            for order in orders:
                cursor.execute("SELECT * FROM order_items WHERE order_id = %s", (order['id'],))
                order['items'] = cursor.fetchall()
    finally: conn.close()
    return {"orders": orders}

@app.put("/api/orders/{order_id}/status")
def update_order_status(order_id: int, status_data: OrderStatusUpdate):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE orders SET status = %s WHERE id = %s", (status_data.status, order_id))
        conn.commit()
    finally: conn.close()
    return {"message": "상태 변경 성공"}

# --- 인증 API ---
@app.post("/api/login")
def login(user: UserLogin):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT password, user_name, role, user_id FROM users WHERE email = %s OR user_id = %s",
                (user.email, user.email)
            )
            result = cursor.fetchone()
            if not result or not bcrypt.checkpw(user.password.encode('utf-8'), result['password'].encode('utf-8')):
                raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다.")
    finally:
        conn.close()
    return {"message": f"{result['user_name']}님 환영합니다!", "user_name": result['user_name'], "role": result['role'], "user_id": result['user_id']}
# --- 회원가입 API ---
@app.post("/api/signup")
def signup(user: UserSignup):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE email = %s", (user.email,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다.")
            hashed_pw = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            cursor.execute(
                "INSERT INTO users (user_id, email, password, user_name) VALUES (%s, %s, %s, %s)",
                (user.email, user.email, hashed_pw, user.user_name)
            )
        conn.commit()
    finally:
        conn.close()
    return {"message": "회원가입이 완료되었습니다."}

# --- 장바구니 담기 API ---
@app.post("/api/cart")
def add_to_cart(item: CartItem):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, quantity FROM cart WHERE user_id = %s AND product_id = %s",
                (item.user_id, item.product_id)
            )
            existing = cursor.fetchone()
            if existing:
                cursor.execute(
                    "UPDATE cart SET quantity = quantity + %s WHERE id = %s",
                    (item.quantity, existing['id'])
                )
            else:
                cursor.execute(
                    "INSERT INTO cart (user_id, product_id, name, price, quantity) VALUES (%s, %s, %s, %s, %s)",
                    (item.user_id, item.product_id, item.name, item.price, item.quantity)
                )
        conn.commit()
    finally:
        conn.close()
    return {"message": "장바구니에 담겼습니다."}

# --- 장바구니 수량 변경 API ---
@app.put("/api/cart/{item_id}")
def update_cart(item_id: int, update: CartUpdate):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE cart SET quantity = %s WHERE id = %s", (update.quantity, item_id))
        conn.commit()
    finally:
        conn.close()
    return {"message": "수량이 변경되었습니다."}

# --- 장바구니 삭제 API ---
@app.delete("/api/cart/{item_id}")
def delete_cart_item(item_id: int):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM cart WHERE id = %s", (item_id,))
        conn.commit()
    finally:
        conn.close()
    return {"message": "삭제되었습니다."}

# --- 주문 생성 API ---
@app.post("/api/orders")
def create_order(order: OrderCreate):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO orders (user_id, customer_name, total_amount) VALUES (%s, %s, %s)",
                (order.user_id, order.customer_name, order.total_amount)
            )
            order_id = cursor.lastrowid
            for item in order.items:
                cursor.execute(
                    "INSERT INTO order_items (order_id, product_id, name, price, quantity) VALUES (%s, %s, %s, %s, %s)",
                    (order_id, item.product_id, item.name, item.price, item.quantity)
                )
            cursor.execute("DELETE FROM cart WHERE user_id = %s", (order.user_id,))
        conn.commit()
    finally:
        conn.close()
    return {"message": "주문이 완료되었습니다.", "order_id": order_id}

# --- 회원 관리 API ---
@app.get("/api/users")
def get_all_users():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, user_id, email, user_name, created_at, role FROM users ORDER BY created_at DESC")
            users = cursor.fetchall()
    finally:
        conn.close()
    return {"users": users}

@app.put("/api/users/{user_id}/role")
def update_user_role(user_id: str, data: dict):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE users SET role = %s WHERE user_id = %s", (data['role'], user_id))
        conn.commit()
    finally:
        conn.close()
    return {"message": "권한이 변경되었습니다."}

@app.delete("/api/users/{user_id}")
def delete_user(user_id: str):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM users WHERE user_id = %s AND role != 'admin'", (user_id,))
        conn.commit()
    finally:
        conn.close()
    return {"message": "회원이 삭제되었습니다."}

# --- 챗봇 API ---
@app.post("/api/chat")
def chat(data: dict):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    user_message = data.get("message", "")
    history = data.get("history", [])

    # RAG 문서 불러오기
    rag_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "rag_docs")
    rag_context = ""
    if os.path.exists(rag_dir):
        for filename in os.listdir(rag_dir):
            if filename.endswith(".txt"):
                file_path = os.path.join(rag_dir, filename)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        rag_context += f.read() + "\n\n"
                except Exception as e:
                    print(f"[RAG 파일 읽기 실패] {filename}: {e}")

    # 상품 데이터도 함께 전달
    all_products = []
    section_map = {
        "featured": "featured", "newItems": "new", "collection": "collection",
        "mug": "mug", "plate": "plate", "tableware": "tableware"
    }
    for section_key, category in section_map.items():
        items = db_data.get("sections", {}).get(section_key, [])
        for index, item in enumerate(items, start=1):
            safe_name = re.sub(r'\[[^\]]*\]', '', item.get('name', ''))
            safe_name = re.sub(r'[^a-z0-9가-힣]+', '-', safe_name.lower()).strip('-')[:30]
            product_id = f"{category}-{index}-{safe_name}"
            all_products.append({
                "id": product_id,
                "name": item.get("name", ""),
                "price": item.get("price", 0),
                "image": item.get("image", ""),
                "category": category,
                "badge": item.get("badge", "")
            })

    product_list_text = "\n".join([
        f"- {p['name']} ({p['price']:,}원) [ID: {p['id']}]"
        for p in all_products
    ])

    messages = [
        {
            "role": "system",
            "content": f"""당신은 PLATE & HOME의 친절한 쇼핑 도우미입니다.
반드시 아래 참고 문서와 상품 목록을 바탕으로 답변하세요.
문서에 없는 내용은 추측하지 말고 '확인이 어렵습니다'라고 답하세요.
답변은 친절하고 자연스러운 한국어로 작성하세요.

[참고 문서]
{rag_context}

[현재 판매 중인 상품 목록]
{product_list_text}

상품 추천, 상품 종류 문의, 특정 카테고리 상품 조회 요청이 오면 반드시 아래 JSON 형식으로만 응답하세요:
{{
  "message": "친절한 답변 텍스트",
  "products": ["상품ID1", "상품ID2", "상품ID3"]
}}

배송, 교환, 반품, 정책 관련 일반 질문은 아래 형식으로 응답하세요:
{{
  "message": "친절한 답변 텍스트",
  "products": []
}}

"~종류 알려줘", "~뭐 있어", "~추천해줘", "~보여줘" 같은 표현은 전부 상품 추천 요청으로 처리하세요.

반드시 JSON 형식으로만 응답하고 다른 텍스트는 포함하지 마세요."""
        }
    ] + history + [{"role": "user", "content": user_message}]

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        max_tokens=1000
    )

    raw = response.choices[0].message.content.strip()

    try:
        import json as json_module
        parsed = json_module.loads(raw)
        message = parsed.get("message", raw)
        product_ids = parsed.get("products", [])
        recommended = [p for p in all_products if p["id"] in product_ids]
    except:
        message = raw
        recommended = []

    return {"reply": message, "products": recommended}

@app.get("/chatbot.html")
def read_chatbot_page(): return FileResponse("chatbot.html")

@app.get("/api/product-image/{product_id}")
def get_product_image(product_id: str):
    section_map = {
        "featured": "featured", "newItems": "new", "collection": "collection",
        "mug": "mug", "plate": "plate", "tableware": "tableware"
    }
    for section_key, category in section_map.items():
        items = db_data.get("sections", {}).get(section_key, [])
        for index, item in enumerate(items, start=1):
            safe_name = re.sub(r'\[[^\]]*\]', '', item.get('name', ''))
            safe_name = re.sub(r'[^a-z0-9가-힣]+', '-', safe_name.lower()).strip('-')[:30]
            pid = f"{category}-{index}-{safe_name}"
            if pid == product_id:
                return FileResponse(item.get("image", ""))
    raise HTTPException(status_code=404, detail="이미지 없음")