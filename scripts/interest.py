#!/usr/bin/env python3
"""Compute the implied interest rate (IRR) of a monthly payment schedule.

Schedule is given as segments "AMOUNTxMONTHS". Negative = you pay out,
positive = you get paid back, 0 = break. Example (default):

    python3 scripts/interest.py -700x24 0x2 770x24
"""
import sys


def parse(segments):
    flows = []
    for seg in segments:
        amount, months = seg.lower().split("x")
        flows += [float(amount)] * int(months)
    return flows


def npv(rate, flows):
    return sum(cf / (1 + rate) ** t for t, cf in enumerate(flows))


def irr(flows, lo=-0.99, hi=1.0, tol=1e-12):
    f_lo, f_hi = npv(lo, flows), npv(hi, flows)
    if f_lo * f_hi > 0:
        raise ValueError("no sign change in NPV; IRR not bracketed")
    for _ in range(500):
        mid = (lo + hi) / 2
        f_mid = npv(mid, flows)
        if abs(f_mid) < tol:
            break
        if f_lo * f_mid < 0:
            hi = mid
        else:
            lo, f_lo = mid, f_mid
    return (lo + hi) / 2


def simple_rate(flows):
    """Annual rate without compounding: net gain / euro-years of principal lent.

    Each repayment is split into principal and interest in the same ratio as
    total paid out / total received.
    """
    paid = -sum(cf for cf in flows if cf < 0)
    received = sum(cf for cf in flows if cf > 0)
    principal_share = paid / received
    balance, euro_months = 0.0, 0.0
    for cf in flows:
        balance += -cf if cf < 0 else -cf * principal_share
        euro_months += balance
    return (received - paid) / (euro_months / 12)


def main(argv):
    segments = argv or ["-700x24", "0x2", "770x24"]
    flows = parse(segments)
    paid = -sum(cf for cf in flows if cf < 0)
    received = sum(cf for cf in flows if cf > 0)
    r = irr(flows)
    print(f"Schedule:        {' '.join(segments)}  ({len(flows)} months)")
    print(f"Total paid out:  {paid:,.2f} €")
    print(f"Total received:  {received:,.2f} €")
    print(f"Net gain:        {received - paid:,.2f} € ({(received / paid - 1) * 100:.2f}% total)")
    print(f"Monthly rate:    {r * 100:.4f} %")
    print(f"Annual nominal:  {r * 12 * 100:.4f} % p.a. (monthly rate x 12)")
    print(f"Annual effective: {((1 + r) ** 12 - 1) * 100:.4f} % p.a. (compounded)")
    print(f"Annual simple:   {simple_rate(flows) * 100:.4f} % p.a. (no compounding)")


if __name__ == "__main__":
    main(sys.argv[1:])
