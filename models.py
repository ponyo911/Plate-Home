from pydantic import BaseModel
from typing import List
from pydantic import BaseModel

class CartItem(BaseModel):
    user_id: str
    product_id: str
    name: str
    price: int
    quantity: int

class CartUpdate(BaseModel):
    quantity: int

    # --- 신규 주문 관련 데이터 모델 ---
class OrderItem(BaseModel):
    product_id: str
    name: str
    price: int
    quantity: int

class OrderCreate(BaseModel):
    user_id: str
    customer_name: str
    items: List[OrderItem]
    total_amount: int

    # --- 회원가입용 데이터 모델 ---
class UserSignup(BaseModel):
    email: str
    password: str
    user_name: str

# --- 로그인용 데이터 모델 ---
class UserLogin(BaseModel):
    email: str
    password: str

    # --- 주문 상태 변경용 데이터 모델 ---
class OrderStatusUpdate(BaseModel):
    status: str