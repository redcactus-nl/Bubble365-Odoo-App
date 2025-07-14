# -*- coding: utf-8 -*-
{
    'name': "Bubble365",
    'summary': "Connect Odoo to 85+ phone platforms for customer details and efficiency.",
    'description': "Connect Odoo to 85+ phone platforms for customer details and efficiency.",
    'author': "Red Cactus B.V.",
    'website': "https://www.redcactus.cloud/en/",
    'category': 'Tools',
    'version': '1.0',
    'installable': True,
    'application': False,
    'depends': ['base', 'web'],
    'data': [],
    'assets': {
        'web.assets_backend': [ 
        'bubble365_odoo/static/src/js/bubble365_systray.js',
        'bubble365_odoo/static/src/css/bubble365.css',
        'bubble365_odoo/static/src/xml/bubble365_systray.xml',
        ],
    },
    'images': ['static/description/banner.gif'],
    'license': 'AGPL-3',
}
