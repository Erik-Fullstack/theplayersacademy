import { Request, Response } from "express";
import path from "node:path"
import { readFile, writeFile } from "node:fs";

// Functions:
// CREATE PLAN
// GET CONFIG
// GET PLANS
// GET PLAN PRICE
// UPDATE PLAN PRICE
// DELETE PLAN 

export class PriceController {
    // *
    // * CREATE PLAN
    // *
    async createPlan(req: Request, res: Response) {
        const { name, price } = req.body;
        const filePath = path.join(__dirname, "../config/prices.json");

        readFile(filePath, "utf-8", (readError, file) => {
            if (readError) {
                console.error(readError);
                res.status(500).json({ error: 'Error reading prices file' });
                return;
            }
            try {
                if (name.length === 0 || price < 0) {
                    res.status(400).json({ error: "Name must have a value and price can't be negative" });
                    return;
                }
                const data = JSON.parse(file);
                const trimmedName = name.replace(/\s+/g, '').toLowerCase();
                if (typeof trimmedName !== 'string' || typeof price !== 'number') {
                    res.status(400).json({ error: 'Invalid plan format' });
                    return;
                } else if (trimmedName in data) {
                    res.status(409).json({ error: `Plan "${trimmedName}" already exists!` });
                    return;
                }
                const updatedData = { ...data, [trimmedName]: price };
                writeFile(filePath, JSON.stringify(updatedData), (readError) => {
                    if (readError) {
                        console.error(readError);
                        res.status(500).json({ error: 'Error writing prices file' });
                        return;
                    }
                    res.status(201).json({ data: { [trimmedName]: price } })
                });
            } catch (error) {
                console.error(error)
                res.status(500).json({ error })
            }
        })
    }

    // *
    // * GET CONFIG
    // *
    async getConfig(req: Request, res: Response) {
        const filePath = path.join(__dirname, "../config/prices.json");

        readFile(filePath, "utf-8", (readError, file) => {
            if (readError) {
                console.error(readError);
                res.status(500).json({ error: 'Error reading prices file' });
                return;
            }
            try {
                const data = JSON.parse(file);
                res.status(200).json({ data })
            } catch (error) {
                console.error(error)
                res.status(500).json({ error })
            }
        })
    }

    // *
    // * GET PLANS
    // *
    async getPlans(req: Request, res: Response) {
        const filePath = path.join(__dirname, "../config/prices.json");

        readFile(filePath, "utf-8", (readError, file) => {
            if (readError) {
                console.error(readError);
                res.status(500).json({ error: 'Error reading prices file' });
                return;
            }
            try {
                const data = JSON.parse(file);
                const currentPlans = Object.keys(data);
                res.status(200).json({ data: currentPlans })
            } catch (error) {
                console.error(error)
                res.status(500).json({ error })
            }
        })
    }

    // *
    // * GET PLAN PRICE
    // *
    async getPlanPrice(req: Request, res: Response) {
        //slots är optional, utan slots visas priset för 1 slot som default
        const { plan, slots } = req.params;
        const filePath = path.join(__dirname, "../config/prices.json");

        readFile(filePath, "utf-8", (readError, file) => {
            if (readError) {
                console.error(readError);
                res.status(500).json({ error: 'Error reading prices file' });
                return;
            }
            try {
                const data = JSON.parse(file);
                if (!(plan in data)) {
                    res.status(404).json({ error: `Plan "${plan}" not found` });
                    return;
                }
                if (slots && isNaN(Number(slots))) {
                    res.status(400).json({ error: 'Invalid slots value' });
                    return;
                }
                res.status(200).json({ data: (slots ? (data[plan] * Number(slots)).toString() : data[plan]).toString() })
            } catch (error) {
                console.error(error);
                res.status(500).json({ error })
            }
        })
    }

    // *
    // * UPDATE PLAN PRICE
    // *
    async updatePlanPrice(req: Request, res: Response) {
        const { plan } = req.params;
        const { newPrice } = req.body;
        const filePath = path.join(__dirname, "../config/prices.json");

        readFile(filePath, "utf-8", (readError, file) => {
            if (readError) {
                console.error(readError);
                res.status(500).json({ error: 'Error reading prices file' });
                return;
            }
            try {
                const data = JSON.parse(file);
                if (typeof newPrice !== 'number' || newPrice < 1) {
                    res.status(400).json({ error: 'Invalid price format' });
                    return;
                } else if (!(plan in data)) {
                    res.status(404).json({ error: `Plan "${plan}" not found` });
                    return;
                }
                const updatedData = { ...data, [plan]: newPrice };
                writeFile(filePath, JSON.stringify(updatedData), (readError) => {
                    if (readError) {
                        console.error(readError);
                        res.status(500).json({ error: 'Error writing prices file' });
                        return;
                    }
                    res.status(200).json({ data: { [plan]: newPrice } })
                });
            } catch (error) {
                console.error(error)
                res.status(500).json({ error })
            }
        })
    }

    // *
    // * DELETE PLAN 
    // *
    async deletePlan(req: Request, res: Response) {
        const { plan } = req.params;
        const filePath = path.join(__dirname, "../config/prices.json");

        readFile(filePath, "utf-8", (readError, file) => {
            if (readError) {
                console.error(readError);
                res.status(500).json({ data: 'Error reading prices file' });
                return;
            }
            try {
                const data = JSON.parse(file);
                if (!(plan in data)) {
                    res.status(404).json({ data: `Plan "${plan}" not found` });
                    return;
                }
                delete data[plan];
                writeFile(filePath, JSON.stringify(data), (readError) => {
                    if (readError) {
                        console.error(readError);
                        res.status(500).json({ data: 'Error writing prices file' });
                        return;
                    }
                    res.status(200).json({ data: "Plan removed successfully" })
                });
            } catch (error) {
                console.error(error)
                res.status(500).json({ error })
            }
        })
    }
}

export const priceController = new PriceController();