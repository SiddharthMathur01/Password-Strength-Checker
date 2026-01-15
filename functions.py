from collections import Counter
import numpy as np
import lightgbm as gbm
import re
import math

model = gbm.Booster(model_file=r"CyberSecurity\Password-Strength-Checker\modle\password_strength_model.txt")

words= {"password", "admin", "welcome", "login", "user","qwerty", "abc", "letmein", "iloveyou", "monkey","dragon", "football", "india", "love", "boss","google", "facebook", "123", "1234", "12345","123456"}
leet= str.maketrans({"0": "o","1": "i","3": "e","4": "a","5": "s","7": "t","@": "a","$": "s"})
confi = {0: 0.70,1: 0.70,2: 0.60,3: 0.80,4: 0.90}


def entropy(password: str) -> float:
    if not password:
        return 0.0

    counts = Counter(password)
    length = len(password)

    return -sum(
        (count / length) * math.log2(count / length)
        for count in counts.values()
    )

def contains_dictionary_word(password: str) -> int:
    pw = password.lower()
    pw_leet = pw.translate(leet)

    for word in words:
        if word in pw or word in pw_leet:
            return 1
    return 0

def features(password: str) -> dict:
    password=str(password)
    length = len(password)

    return {
        "length": length,
        "upper_count": sum(c.isupper() for c in password),
        "lower_count": sum(c.islower() for c in password),
        "digit_count": sum(c.isdigit() for c in password),
        "special_count": sum(not c.isalnum() for c in password),
        "unique_char_ratio": len(set(password)) / length if length else 0,
        "entropy": entropy(password),
        "has_dictionary_word": contains_dictionary_word(password),
        "has_sequence": int(bool(re.search(r"(abc|123|qwerty)", password.lower()))),
        "has_repeat": int(bool(re.search(r"(.)\1{2,}", password)))
    }


order = ["length", "upper_count", "lower_count", "digit_count", "special_count","unique_char_ratio", "entropy","has_dictionary_word","has_sequence","has_repeat"]
def passwrd_vector(password):
    f = features(password)
    return [f[x] for x in order]


def predict_password(password: str):
    X = np.array([passwrd_vector(password)])
    probs = model.predict(X)[0]  
    pred_class = int(np.argmax(probs))
    confidence = float(np.max(probs))
    feedback = password_feedback(password)

    if confidence < confi[pred_class]:
        pred_class = max(0, pred_class - 1)
        reason = "Low confidence prediction"
    else:
        reason = "High confidence prediction"

    return pred_class, confidence, probs, reason, feedback



def password_feedback(password: str):
    password = password if isinstance(password, str) else ""
    f = features(password)
    length = len(password)

    if length < 8:
        return "Password is too short (less then 8 characters)"
    elif f["has_dictionary_word"]:
        return "Password contains common or dictionary words"
    elif f["has_sequence"]:
        return "Password contains predictable sequences like '123' or 'abc'"
    elif f["has_repeat"]:
        return "Password contains repeated characters"
    elif f["upper_count"] == 0:
        return "Add uppercase letters (A–Z)"
    elif f["lower_count"] == 0:
        return "Add lowercase letters (a–z)"
    elif f["digit_count"] == 0:
        return "Add numbers (0–9)"
    elif f["special_count"] == 0:
        return "Add special characters (!, @, #, etc.)"
    elif f["entropy"] < 2.5:
        return "Make the password more random and less predictable"
    elif length >= 12 and f["entropy"] >= 3.5:
        return "Strong password,Consider using a password manager"

    else:
        return "Moderate password strength. Consider increasing length or complexity."
