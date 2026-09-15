import time
from functools import wraps

import jwt
from flask import request, jsonify, g

import config


def make_token(user_id):
    payload = {"user_id": user_id, "exp": time.time() + config.TOKEN_EXP_HOURS * 3600}
    return jwt.encode(payload, config.SECRET_KEY, algorithm="HS256")


def decode_token(token):
    return jwt.decode(token, config.SECRET_KEY, algorithms=["HS256"])


def token_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401
        token = auth_header.split(" ", 1)[1]
        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired, please log in again"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        g.user_id = payload["user_id"]
        return f(*args, **kwargs)

    return wrapper
