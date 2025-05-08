/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IInventory } from "../../pages/inventory/interface";

export const inventoryMock: IInventory[] = [
    {
        id: 1,
        name: "ATM Machine",
        quantityInStock: 15,
        unitOfMeasure: "pcs",
        location: "Branch A",
        category: "ATM",
        reorderLevel: "5",
        costPrice: "8000.00",
        purchasePrice: "10000.00",
        supplier: "BankTech Solutions",
        description: "Automated Teller Machine for cash withdrawals and deposits",
        expirationDate: "N/A"
    },
    {
        id: 2,
        name: "Cash Drawer",
        quantityInStock: 50,
        unitOfMeasure: "pcs",
        location: "Branch B",
        category: "Cash Handling",
        reorderLevel: "20",
        costPrice: "150.00",
        purchasePrice: "200.00",
        supplier: "SafeGuard Supplies",
        description: "Secure cash drawer for tellers",
        expirationDate: "N/A"
    },
    {
        id: 3,
        name: "Banking Printer",
        quantityInStock: 25,
        unitOfMeasure: "pcs",
        location: "Branch C",
        category: "Office Equipment",
        reorderLevel: "10",
        costPrice: "350.00",
        purchasePrice: "500.00",
        supplier: "PrintPro Supplies",
        description: "High-speed printer for customer receipts and reports",
        expirationDate: "N/A"
    },
    {
        id: 4,
        name: "Coin Sorting Machine",
        quantityInStock: 10,
        unitOfMeasure: "pcs",
        location: "Branch A",
        category: "Coin Handling",
        reorderLevel: "3",
        costPrice: "1200.00",
        purchasePrice: "1500.00",
        supplier: "CoinTech Systems",
        description: "Automated machine for sorting and counting coins",
        expirationDate: "N/A"
    },
    {
        id: 5,
        name: "Vault Safe",
        quantityInStock: 8,
        unitOfMeasure: "pcs",
        location: "Branch B",
        category: "Security",
        reorderLevel: "2",
        costPrice: "3000.00",
        purchasePrice: "3500.00",
        supplier: "SecureSafe Co.",
        description: "High-security vault for storing cash and valuables",
        expirationDate: "N/A"
    },
    {
        id: 6,
        name: "Check Scanner",
        quantityInStock: 20,
        unitOfMeasure: "pcs",
        location: "Branch C",
        category: "Check Processing",
        reorderLevel: "5",
        costPrice: "500.00",
        purchasePrice: "650.00",
        supplier: "ScanTech Solutions",
        description: "Scanner for processing and depositing checks",
        expirationDate: "N/A"
    },
    {
        id: 7,
        name: "Ream of Paper",
        quantityInStock: 200,
        unitOfMeasure: "reams",
        location: "Office Supplies",
        category: "Stationery",
        reorderLevel: "50",
        costPrice: "3.00",
        purchasePrice: "5.00",
        supplier: "PaperCo",
        description: "Standard A4 printing paper, 500 sheets per ream",
        expirationDate: "N/A"
    },
    {
        id: 8,
        name: "Desktop Computer",
        quantityInStock: 30,
        unitOfMeasure: "pcs",
        location: "Office Equipment",
        category: "Electronics",
        reorderLevel: "10",
        costPrice: "600.00",
        purchasePrice: "800.00",
        supplier: "CompTech Supplies",
        description: "High-performance desktop computer for office tasks",
        expirationDate: "N/A"
    },
    {
        id: 9,
        name: "Box of Pens",
        quantityInStock: 100,
        unitOfMeasure: "boxes",
        location: "Office Supplies",
        category: "Stationery",
        reorderLevel: "30",
        costPrice: "5.00",
        purchasePrice: "8.00",
        supplier: "WriteRight Stationery",
        description: "Box of 20 premium ballpoint pens",
        expirationDate: "N/A"
    },
    {
        id: 10,
        name: "Office Chair",
        quantityInStock: 50,
        unitOfMeasure: "pcs",
        location: "Office Furniture",
        category: "Furniture",
        reorderLevel: "15",
        costPrice: "80.00",
        purchasePrice: "120.00",
        supplier: "ErgoFurniture Ltd.",
        description: "Ergonomic office chair with adjustable height and back support",
        expirationDate: "N/A"
    },
    {
        id: 11,
        name: "Laptop",
        quantityInStock: 20,
        unitOfMeasure: "pcs",
        location: "Office Equipment",
        category: "Electronics",
        reorderLevel: "5",
        costPrice: "500.00",
        purchasePrice: "700.00",
        supplier: "TechSupplies Co.",
        description: "High-performance laptop for business use",
        expirationDate: "N/A"
    }
];
