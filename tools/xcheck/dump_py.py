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
from lasotuvi import Sao as _sao_module       # noqa: E402
from lasotuvi.Sao import Sao as _Sao          # noqa: E402

# lasotuvi giu moi sao trong mot bien toan cuc cap module, va DiaBan.py chi goi
# anDacTinh() khi o tuong ung trong maTranDacTinh co gia tri:
#     if maTranDacTinh[sao.saoID][viTriDiaBan] in ["M", "V", "Đ", "B", "H"]:
# Gap o None thi sao GIU NGUYEN dac tinh cua la so truoc do -> ro trang thai.
# Cac bang nay chi chua "Đ" va None nen ro chi lan duoc mot gia tri, khien loi
# trong rat "on dinh" va de bi bo qua. Reset truoc moi la so de doi chieu dung.
_SAO_TOAN_CUC = [v for v in vars(_sao_module).values() if isinstance(v, _Sao)]


def resetDacTinh():
    for s in _SAO_TOAN_CUC:
        s.saoDacTinh = None

CASES = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cases.json'),
                       encoding='utf-8'))

out = []
for c in CASES:
    nn, tt, yy, gio, gt = c['d'], c['m'], c['y'], c['gio'], c['g']
    resetDacTinh()
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
