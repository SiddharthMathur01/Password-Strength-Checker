from collections import Counter
import numpy as np
import lightgbm as gbm
import re
import math

model = gbm.Booster(model_file=r"CyberSecurity\Password-Strength-Checker\modle\password_strength_model.txt")

words= {"password", "admin", "welcome", "login", "user","qwerty", "abc", "letmein", "iloveyou", "monkey","dragon", "football", "india", "love", "boss","google", "facebook", "123", "1234", "12345","123456"}
leet= str.maketrans({"0": "o","1": "i","3": "e","4": "a","5": "s","7": "t","@": "a","$": "s"})

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
    return pred_class, confidence, probs