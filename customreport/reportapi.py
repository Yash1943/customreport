import frappe
from frappe import _



@frappe.whitelist()
def get_first_report():
    res = frappe.db.sql('''
    SELECT *
    FROM tabYash_test tyt''',
    as_dict=True)
    if not res:
        return []
    return res