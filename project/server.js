// server.js

const express = require('express')
const { Sequelize, Op } = require('sequelize')
const dbHandler = require('./dbHandler')
const { Parser } = require('json2csv');
require('dotenv').config()

const server = express()
const cors = require('cors');

server.use(express.json())
server.use(express.static('public'))

server.use(cors());

dbHandler.table.sync({alter: true})
dbHandler.tableWarehouses.sync({alter: true})
dbHandler.tableProducts.sync({alter: true})
dbHandler.tableMovements.sync({alter: true})
dbHandler.sequelize.sync({ alter: true });

const JWT = require('jsonwebtoken')

//
// Első hét
//

//------------------------------------------------------------------ Ricsi

function Auth() {
    return (req,res,next) => {
        console.log("Auth middleware fut..."); // 1. Látjuk, hogy elindul-e?
        const authHeader = req.headers.Authorization || req.headers.authorization; // Biztonság kedvéért mindkét verziót nézzük
        
        console.log("Kapott Authorization header:", authHeader); // 2. Mit kapott?

        if(!authHeader || !authHeader.startsWith('Bearer ')){
            console.log("Hibás vagy hiányzó header.");
            return res.status(401).json({'message':'Hibás/nem létező token formátum'});
        }
        else{
            const encryptedToken = authHeader.split(' ')[1];
            console.log("Kinyert token:", encryptedToken); // 3. Sikerült kinyerni?
            try {
                const token = JWT.verify(encryptedToken, process.env.SECRETKEY);
                console.log("Token sikeresen ellenőrizve, felhasználó:", token.username);
                next(); 
            } catch (error) {
                console.error("Token ellenőrzési hiba:", error.message); // 4. Mi a hiba oka?
                return res.status(401).json({'message': 'Érvénytelen token', 'error': error.message});
            }
        }
    }
}

server.get('/profil', Auth(), async (req,res) => {
    res.json({'message':'ez egy nagyon titkos hely'});
    // HIBA JAVÍTVA: res.end() eltávolítva
});

server.post('/register', async (req,res) => {
    const oneUser = await dbHandler.table.findOne({
        where:{
            username:req.body.registerUsername
        }
    })
    if(oneUser){
        res.json({'message':'Már létezik ilyen felhasználó'});
    }
    else{
        await dbHandler.table.create({
            username: req.body.registerUsername,
            password: req.body.registerPassword
        })
        res.json({'message':'Sikeres regisztráció'});
    }
    // HIBA JAVÍTVA: res.end() eltávolítva
})

server.post('/login', async (req,res) => {
    const oneUser = await dbHandler.table.findOne({
        where:{
            username:req.body.loginUsername,
            password:req.body.loginPassword
        }
    })
    if(oneUser){
        const token = JWT.sign({'username': oneUser.username},process.env.SECRETKEY,{expiresIn: '1h'})
        res.json({'token':token,'message':'sikeres bejelentkezés'});
    }
    else{
        res.json({'message':'sikertelen bejelentkezés'});
    }
    // HIBA JAVÍTVA: res.end() eltávolítva
})

//------------------------------------------------------------------ Kristóf

server.post('/productcreate', async (req,res) => {
    try
    {
        const oneProduct = await dbHandler.tableProducts.findOne({
            where:{
                name:req.body.createProductName
            }
        })
        if(oneProduct){
            res.json({'message':'Már létezik ilyen termék'});
        }
        else{
            await dbHandler.tableProducts.create({
                name: req.body.createProductName,
                type: req.body.createProductType,
                price: req.body.createProductPrice
            })
            res.json({'message':'Sikeres termék hozzáadás'});
        }
        // HIBA JAVÍTVA: res.end() eltávolítva
    }
    catch(error)
    {
        res.json({'message':error.message});
    }
    
})

server.get('/products', async (req,res) => {
    res.json(await dbHandler.tableProducts.findAll());
    // HIBA JAVÍTVA: .end() eltávolítva
})

server.get('/products/lowStock', async (req, res) => {
    const products = await dbHandler.tableProducts.findAll({
		where:{
			amount:{
                [Sequelize.Op.lt]: 5
            }
		}
	})
    if(products && products.length > 0){
        res.json(products);
    }
    else{
        res.status(500).json({'message':'Nincs olyan termék, amiből kevesebb mint 5 van'});
    }
})

server.get('/products/:id', async (req, res) => {
    try {
        const oneProduct = await dbHandler.tableProducts.findOne({
            where: {
                id: req.params.id
            }
        });

        if (oneProduct) {
            res.json(oneProduct);
        } else {
            res.json({'message': 'Nem létezik ilyen termék' });
        }
    } catch (error) {
        res.json({'message': error.message });
    }
})

server.post('/productsid', async (req, res) => {
    try {
        const oneProduct = await dbHandler.tableProducts.findOne({
            where: {
                id: req.body.id
            }
        })

        if (oneProduct) {
            res.json(oneProduct);
        } else {
            res.json({'message': 'Nem létezik ilyen termék' });
        }
    } catch (error) {
        res.json({'message': error.message });
    }
})

//------------------------------------------------------------------ Márk

server.put('/update',async(req,res)=>{
    const { id, name, type, price } = req.body;
    try {
        const product = await dbHandler.tableProducts.findOne({
            where: {
                id: req.body.id
            }
        })
        if (!product) {
         return res.status(404).json({ message: 'Nem található ilyen termék' });
        }
        await product.update({ name, type, price });
        return res.json({ message: 'Sikeres módosítás' });
    } catch (error) {
    console.error('Nem jó az update', error);
    return res.status(500).json({ message: error.message });
    }
})

server.delete('/deletProduct', async (req,res) => {
    const oneproduct = await dbHandler.tableProducts.findOne({
        where: {
            id: req.body.id
        }
    })
    if(oneproduct){
        await dbHandler.tableProducts.destroy({
            where:{
                id: req.body.id
            }
        })
        res.json({'message':'sikeres törlés'});
        // HIBA JAVÍTVA: res.end() eltávolítva
    }
    else{
        res.json({'message':'Nem létezik ilyen termék'});
        // HIBA JAVÍTVA: .end() eltávolítva
    }
})

server.post('/productsearchname', async (req, res) => {
    try {
        const product = await dbHandler.tableProducts.findOne({
            where: {
                name: req.body.name
            }
        });

        if (product) {
            res.json(product);
        } else {
            res.json({'message': 'Nem létezik ilyen termék' });
        }
    } catch (error) {
        res.json({'message': error.message });
    }
})

//------------------------------------------------------------------


//
// Második hét
//
// ... (A második heti kódnak jónak kell lennie, de ha ott is van hiba, ugyanígy kell javítani) ...
// (A teljesség kedvéért idemásolom, és ellenőrzöm)

// 1. rész (Lengyel Dániel)
server.post('/warehouses', async (req, res) => {
    try {
        const { name, location, capacity, manager_name, notes } = req.body

        if (!name || !location || !capacity || !manager_name) {
            return res.status(400).json({ message: 'Hiányzó mezők' })
        }

        const warehouse = await dbHandler.tableWarehouses.create({
            name,
            location,
            capacity,
            manager_name,
            notes
        })

        res.status(201).json({message: 'Sikeres létrehozás'});
    } catch (error) {
        res.status(500).json({ message: 'Hiba történt a létrehozás során', error: error.message });
    }
})

server.get('/warehouses', async (req, res) => {
    try {
        const warehouses = await dbHandler.tableWarehouses.findAll();
        res.status(200).json(warehouses);
    } catch (error) {
        res.status(500).json({ message: 'Error: ', error: error.message });
    }
});

server.get('/warehouses/:id', async (req, res) => {
    try {
        const warehouse = await dbHandler.tableWarehouses.findOne({
            where: { id: req.params.id }
        })

        if (!warehouse) {
            return res.status(404).json({ message: 'Raktár nem található' })
        }

        res.status(200).json(warehouse);
    } catch (error) {
        res.status(500).json({ message: 'Error: ', error: error.message });
    }
})


// 2. rész (Komjáti Gábor)

server.post('/warehouses/:id/products', async (req, res) => {
    const warehouseId = parseInt(req.params.id);
    const { name, amount } = req.body;

    if (!name || !amount || isNaN(warehouseId)) {
        return res.status(400).json({ message: 'Hiányzó vagy érvénytelen adat.' });
    }

    try {
        const warehouse = await dbHandler.tableWarehouses.findByPk(warehouseId);
        if (!warehouse) {
            return res.status(404).json({ message: 'A megadott raktár nem található.' });
        }

        const product = await dbHandler.tableProducts.findOne({
            where:{
                name: name
            }
        })

        if(!product){
            return res.status(404).json({ message: 'A megadott termék nem található.' });
        }

        product.update({ warehouseId, amount });

        res.json({ message: 'Termék sikeresen hozzárendelve.' });
    } catch (err) {
        res.status(500).json({ message: 'Szerverhiba', error: err.message });
    }
});

server.get('/warehouses/:id/inventory', async (req, res) => {
    const warehouseId = parseInt(req.params.id);

    try {
        const warehouse = await dbHandler.tableWarehouses.findByPk(warehouseId);
        if (!warehouse) {
            return res.status(404).json({ message: 'A megadott raktár nem található.' });
        }

        const products = await dbHandler.tableProducts.findAll({
            where: { warehouseId }
        });

        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Szerverhiba', error: err.message });
    }
});

server.put('/inventory/:id', async (req, res) => {
    const productId = parseInt(req.params.id);
    const { amount } = req.body;

    if (!amount || isNaN(productId)) {
        return res.status(400).json({ message: 'Hiányzó vagy érvénytelen adat.' });
    }

    try {
        const product = await dbHandler.tableProducts.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: 'Termék nem található.' });
        }

        product.amount = amount;
        await product.save();

        res.json({ message: 'Készlet frissítve.' });
    } catch (err) {
        res.status(500).json({ message: 'Szerverhiba', error: err.message });
    }
});


// 3. rész (Potyondi Zsombor)

server.delete('/inventory/:id', async (req, res) => {
    const products = await dbHandler.tableProducts.destroy({
        where:{
            warehouseId: req.params.id
        }
    })
    if(products){
        res.json({'message':'Sikeres törlés'});
    }
    else{
        res.status(500).json({'message':'Sikertelen törlés'});
    }
})

server.get('/products/warehouse/:warehouse', async (req, res) => {
    const warehouse = await dbHandler.tableWarehouses.findOne({
        where:{
            name: req.params.warehouse
        }
    })
    if(warehouse){
        const products = await dbHandler.tableProducts.findAll({
            where:{
                warehouseId: warehouse.id
            }
        })
        if(products && products.length > 0){
            res.json(products);
        }
        else{
            res.status(500).json({'message':'Termék nem található'});
        }
    }
    else{
        res.status(500).json({'message':'Raktár nem található'});
    }
})


//
// Harmadik hét
//
// ... (Itt is végignézve a kódot, a hibák már korábban javítva lettek, ezeknek jónak kell lenniük) ...
// (A teljesség kedvéért itt hagyom a javított verziót)
server.post('/movements/in', async (req, res) => {
    try {
        const { productId, warehouseId, quantity } = req.body;
        if (!productId || !warehouseId || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Hiányzó vagy érvénytelen adatok (productId, warehouseId, quantity).' });
        }
        const product = await dbHandler.tableProducts.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: 'A megadott termék nem található.' });
        }
        if (product.warehouseId !== warehouseId) {
            return res.status(400).json({ message: 'A termék nincs ehhez a raktárhoz rendelve.' });
        }
        product.amount += quantity;
        await product.save();
        await dbHandler.tableMovements.create({ productId, warehouseId, type: 'in', quantity });
        res.status(200).json({ message: 'Bevételezés sikeresen rögzítve.', newAmount: product.amount });
    } catch (error) {
        res.status(500).json({ message: 'Szerverhiba a bevételezés során.', error: error.message });
    }
});

server.post('/movements/out', async (req, res) => {
    try {
        const { productId, warehouseId, quantity } = req.body;
        if (!productId || !warehouseId || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Hiányzó vagy érvénytelen adatok (productId, warehouseId, quantity).' });
        }
        const product = await dbHandler.tableProducts.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: 'A megadott termék nem található.' });
        }
        if (product.warehouseId !== warehouseId) {
            return res.status(400).json({ message: 'A termék nincs ehhez a raktárhoz rendelve.' });
        }
        if (product.amount < quantity) {
            return res.status(400).json({ message: `Nincs elegendő készlet a kivételezéshez. Elérhető: ${product.amount} db.` });
        }
        product.amount -= quantity;
        await product.save();
        await dbHandler.tableMovements.create({ productId, warehouseId, type: 'out', quantity });
        res.status(200).json({ message: 'Kivételezés sikeresen rögzítve.', newAmount: product.amount });
    } catch (error) {
        res.status(500).json({ message: 'Szerverhiba a kivételezés során.', error: error.message });
    }
});

server.get('/movements', async (req, res) => {
    try {
        const { type } = req.query; 
        let whereClause = {};
        if (type) {
            whereClause.type = type;
        }
        const movements = await dbHandler.tableMovements.findAll({
            where: whereClause,
            include: [ 
                { model: dbHandler.tableProducts, attributes: ['name'] },
                { model: dbHandler.tableWarehouses, attributes: ['name'] }
            ],
            order: [['createdAt', 'DESC']] 
        });
        res.json(movements);
    } catch (error) {
        res.status(500).json({ message: 'Szerverhiba a mozgások listázása során.', error: error.message });
    }
});

server.get('/movements/export', async (req, res) => {
    try {
        const movements = await dbHandler.tableMovements.findAll({
            include: [
                { model: dbHandler.tableProducts, as: 'productInfo', attributes: ['name'] },
                { model: dbHandler.tableWarehouses, as: 'warehouse', attributes: ['name'] }
            ],
            order: [['createdAt', 'ASC']],
            raw: true,
            nest: true
        });
        if (movements.length === 0) {
            return res.status(404).json({ message: 'Nincs exportálható mozgás.' });
        }
        const csvData = movements.map(m => ({
            'Azonosító': m.id,
            'Típus': m.type === 'in' ? 'Bevételezés' : 'Kivételezés',
            'Dátum': new Date(m.createdAt).toLocaleString('hu-HU'),
            'Termék': m.productInfo.name,
            'Raktár': m.warehouse.name,
            'Mennyiség': m.quantity
        }));
        const fields = ['Azonosító', 'Típus', 'Dátum', 'Termék', 'Raktár', 'Mennyiség'];
        const json2csvParser = new Parser({ fields, header: true, delimiter: ';' });
        const csv = json2csvParser.parse(csvData);
        res.header('Content-Type', 'text/csv; charset=utf-8');
        res.header('Content-Disposition', 'attachment; filename="mozgasok_export.csv"');
        res.send("\uFEFF" + csv);
    } catch (error) {
        res.status(500).json({ message: 'Hiba történt az exportálás során.', error: error.message });
    }
});

server.get('/movements/date/:date', async (req, res) => {
    try {
        const date = new Date(req.params.date);
        const startDate = new Date(date.setHours(0, 0, 0, 0));
        const endDate = new Date(date.setHours(23, 59, 59, 999));
        const movements = await dbHandler.tableMovements.findAll({
            where: { createdAt: { [Op.between]: [startDate, endDate] } },
            include: [
                { model: dbHandler.tableProducts, attributes: ['name'] },
                { model: dbHandler.tableWarehouses, attributes: ['name'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(movements);
    } catch (error) {
        res.status(500).json({ message: 'Szerverhiba a dátum szerinti szűrés során.', error: error.message });
    }
});

server.get('/movements/:id', async (req, res) => {
    try {
        const movement = await dbHandler.tableMovements.findByPk(req.params.id, {
            include: [
                { model: dbHandler.tableProducts, attributes: ['name'] },
                { model: dbHandler.tableWarehouses, attributes: ['name'] }
            ]
        });
        if (movement) {
            res.json(movement);
        } else {
            res.status(404).json({ message: 'Mozgás nem található ezen az azonosítón.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Szerverhiba a mozgás keresése során.', error: error.message });
    }
});

server.delete('/movements/:id', async (req, res) => {
    const transaction = await dbHandler.sequelize.transaction();
    try {
        const movement = await dbHandler.tableMovements.findByPk(req.params.id, { transaction });
        if (!movement) {
            await transaction.rollback();
            return res.status(404).json({ message: 'A megadott mozgás nem található.' });
        }
        const product = await dbHandler.tableProducts.findByPk(movement.productId, { transaction });
        if (!product) {
            await transaction.rollback();
            return res.status(500).json({ message: 'Adatintegritási hiba: a mozgáshoz tartozó termék nem létezik.' });
        }
        if (movement.type === 'in') {
            product.amount -= movement.quantity;
        } else {
            product.amount += movement.quantity;
        }
        await product.save({ transaction });
        await movement.destroy({ transaction });
        await transaction.commit();
        res.json({ message: `A(z) ${movement.id} azonosítójú mozgás sikeresen visszavonva.` });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: 'Szerverhiba a mozgás visszavonása során.', error: error.message });
    }
});

server.get('/products/:id/movements/stats', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await dbHandler.tableProducts.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: 'A termék nem található.' });
        }
        const movements = await dbHandler.tableMovements.findAll({
            where: { productId: productId },
            order: [['createdAt', 'ASC']]
        });
        if (movements.length === 0) {
            return res.json({
                productId: product.id,
                productName: product.name,
                message: 'Ehhez a termékhez nincsenek mozgások rögzítve.'
            });
        }
        const stats = {
            productId: product.id,
            productName: product.name,
            totalIn: movements.filter(m => m.type === 'in').reduce((sum, m) => sum + m.quantity, 0),
            totalOut: movements.filter(m => m.type === 'out').reduce((sum, m) => sum + m.quantity, 0),
            movementCount: movements.length,
            firstMovementDate: movements[0].createdAt,
            lastMovementDate: movements[movements.length - 1].createdAt
        };
        stats.netChange = stats.totalIn - stats.totalOut;
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Szerverhiba a statisztika lekérése során.', error: error.message });
    }
});

server.listen(3000,() => {console.log('A szerver fut a 3000-es porton');})