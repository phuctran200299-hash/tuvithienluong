# -*- coding: utf-8 -*-
"""Dump la so tu lasotuvi (doanguyen, Python goc) ra JSON de doi chieu."""
import json
import os
import sys

# Trỏ tới bản clone của doanguyen/lasotuvi: đặt biến môi trường LASOTUVI, mặc định ../../.ref/lasotuvi
REF = os.environ.get('LASOTUVI') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '.ref', 'lasotuvi')
sys.path.insert(0, os.path.abspath(REF))

from lasotuvi.App import lapDiaBan            # noqa: E402
from lasotuvi.DiaBan import diaBan            # noqa: E402
from lasotuvi.AmDuong import (ngayThangNam, ngayThangNamCanChi,  # noqa: E402
                              timCuc, nguHanh)

CASES = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cases.json'),
                       encoding='utf-8'))

out = []
for c in CASES:
    nn, tt, yy, gio, gt = c['d'], c['m'], c['y'], c['gio'], c['g']
    try:
        db = lapDiaBan(diaBan, nn, tt, yy, gio, gt, True, 7)
    except Exception as e:                                   # noqa: BLE001
        out.append({'err': str(e)})
        continue
    aNgay, aThang, aNam, nhuan = ngayThangNam(nn, tt, yy, True, 7)
    canThang, canNam, chiNam = ngayThangNamCanChi(nn, tt, yy, True, 7)
    cuc = nguHanh(timCuc(db.cungMenh, canNam))
    cungs = []
    for i in range(1, 13):
        cg = db.thapNhiCung[i]
        sao = []
        for s in cg.cungSao:
            ten = s['saoTen']
            if s['saoID'] == 38:
                ten = 'Quan phủ'      # lasotuvi dat cung ten "Quan phù" cho 2 sao khac nhau
            sao.append([s['saoID'], ten, s['saoDacTinh']])
        cungs.append({
            'so': i,
            'cungChu': getattr(cg, 'cungChu', None) if isinstance(getattr(cg, 'cungChu', None), str) else None,
            'daiHan': getattr(cg, 'cungDaiHan', None),
            'tieuHan': getattr(cg, 'cungTieuHan', None),
            'than': bool(cg.cungThan),
            'tuan': bool(getattr(cg, 'tuanTrung', False)),
            'triet': bool(getattr(cg, 'trietLo', False)),
            'sao': sao,
        })
    out.append({
        'am': [aNgay, aThang, aNam, nhuan],
        'canNam': canNam, 'chiNam': chiNam,
        'cungMenh': db.cungMenh, 'cungThan': db.cungThan,
        'cuc': cuc['tenCuc'],
        'cucSo': cuc['cuc'],
        'cung': cungs,
    })

path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'py.json')
json.dump(out, open(path, 'w', encoding='utf-8'), ensure_ascii=False)
print('da ghi', path, len(out), 'la so')
