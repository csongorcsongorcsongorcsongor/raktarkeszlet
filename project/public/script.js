document.body.style.backgroundColor = 'pink'

// --- ÚJ SOR KEZDETE ---
const API_URL = 'http://localhost:3000'; // A Node.js szervered címe
// --- ÚJ SOR VÉGE ---

//
// Első hét
//

//-------------------------------------------------- Ricsi

function Login(){
    const loginRequest = new XMLHttpRequest()
    loginRequest.open('post', `${API_URL}/login`)
    loginRequest.setRequestHeader('Content-Type','Application/json')
    loginRequest.send(JSON.stringify({
        'loginUsername':user.value,
        'loginPassword':pass.value
    }))
    loginRequest.onreadystatechange = () => {
        if(loginRequest.readyState == 4){
            if (!loginRequest.response) {
                console.error("A válasz üres volt. Valószínűleg a szerver nem elérhető vagy CORS hiba történt.");
                alert("Hálózati hiba. Ellenőrizd a konzolt!");
                return;
            }
            const result = JSON.parse(loginRequest.response)
            console.log(result.message)
            alert(result.message)
            if(loginRequest.status == 200 && result.token){
                sessionStorage.setItem('token',result.token)
                console.log('Sikeres token mentés')
            }
        }
    }
}
function Register(){
    const registerRequest = new XMLHttpRequest()
    registerRequest.open('post', `${API_URL}/register`)
    registerRequest.setRequestHeader('Content-Type','Application/JSON')
    registerRequest.send(JSON.stringify({
        'registerUsername':user.value,
        'registerPassword':pass.value
    }))
    registerRequest.onreadystatechange = () => {
        if(registerRequest.readyState == 4){
            if (!registerRequest.response) {
                console.error("A válasz üres volt. Valószínűleg a szerver nem elérhető vagy CORS hiba történt.");
                alert("Hálózati hiba. Ellenőrizd a konzolt!");
                return;
            }
            const result = JSON.parse(registerRequest.response)
            console.log(result.message)
            alert(result.message)
        }
    }
}
function Profil(){
    const profilRequest = new XMLHttpRequest()
    profilRequest.open('get', `${API_URL}/profil`)
    profilRequest.setRequestHeader('Authorization','Bearer ' + sessionStorage.getItem('token'))
    profilRequest.send(); // A kérést el is kell küldeni!
    profilRequest.onreadystatechange = () => {
        if (profilRequest.readyState == 4) {
            const result = JSON.parse(profilRequest.response);
            alert(result.message);
        }
    }
}

//-------------------------------------------------- Kristóf

function CreateProductClick(){
    const registerRequest = new XMLHttpRequest()
    registerRequest.open('post', `${API_URL}/productcreate`)
    registerRequest.setRequestHeader('Content-Type','Application/JSON')
    registerRequest.send(JSON.stringify({
        'createProductName': createProductName.value,
        'createProductType': createProductType.value,
        'createProductPrice': createProductPrice.value
    }))
    registerRequest.onreadystatechange = () => {
        if(registerRequest.readyState == 4){
            const result = JSON.parse(registerRequest.response)
            console.log(result.message)
            alert(result.message)
        }
    }
}

function OneProductClick() {
    const productId = document.getElementById('id').value
    if (!productId) { return alert('Kérlek, adj meg egy termékazonosítót!') }
    const request = new XMLHttpRequest()
    request.open('post', `${API_URL}/productsid`)
    request.setRequestHeader('Content-Type', 'application/json')
    request.send(JSON.stringify({ 'id': productId }))
    request.onreadystatechange = () => {
        if (request.readyState == 4) {
            if (request.status == 200) {
                const result = JSON.parse(request.response)
                if (result.message) {
                    alert(result.message)
                } else {
                    alert(`Termék: ${result.name}\nTípus: ${result.type}\nÁr: ${result.price}`)
                }
            } else {
                alert('Hiba történt a lekérdezés során!')
            }
        }
    }
}

function ListAllProducts() {
    const request = new XMLHttpRequest()
    request.open('GET', `${API_URL}/products`)
    request.onreadystatechange = () => {
      if (request.readyState === 4) {
        const container = document.getElementById('listAllProductDiv')
        container.innerHTML = ''
        if (request.status === 200) {
          const products = JSON.parse(request.responseText)
          if (products.length === 0) {
            container.textContent = 'Nincsenek termékek.'
          } else {
            products.forEach(p => {
              const row = document.createElement('div')
              row.className = 'product-item'
              row.textContent = `ID: ${p.id} — Név: ${p.name} — Típus: ${p.type} — Ár: ${p.price}`
              container.appendChild(row)
            })
          }
        } else {
          alert('Hiba történt a termékek listázása során!')
        }
      }
    }
    request.send()
  }

//-------------------------------------------------- Márk

function EditProductClick() {
  const id = document.getElementById('editId').value;
  const name = document.getElementById('editName').value;
  const type = document.getElementById('editType').value;
  const price = document.getElementById('editPrice').value;

  if (!id) { return alert('Add meg a termékazonosítót!'); }
  if (!name || !type || !price) { return alert('Töltsd ki az összes új értéket!'); }

  const req = new XMLHttpRequest();
  req.open('PUT', `${API_URL}/update`);
  req.setRequestHeader('Content-Type','application/json');
  req.send(JSON.stringify({ id, name, type, price }));

  req.onreadystatechange = () => {
    if (req.readyState === 4) {
      const resp = JSON.parse(req.response);
      if (req.status === 200) {
        alert(resp.message || 'Sikeres módosítás');
      } else {
        alert('Hiba a módosítás során: ' + (resp.message||req.status));
      }
    }
  };
}

function DeleteProductClick() {
  const id = document.getElementById('editId').value;
  if (!id) { return alert('Add meg a törölni kívánt termék azonosítóját!'); }

  const req = new XMLHttpRequest();
  req.open('DELETE', `${API_URL}/deletProduct`);
  req.setRequestHeader('Content-Type','application/json');
  req.send(JSON.stringify({ id }));

  req.onreadystatechange = () => {
    if (req.readyState === 4) {
      const resp = JSON.parse(req.response);
      if (req.status === 200) {
        alert(resp.message || 'Sikeres törlés');
      } else {
        alert('Hiba a törlés során: ' + (resp.message||req.status));
      }
    }
  };
}

function FindByNameClick() {
  const name = document.getElementById('editName').value;
  if (!name) { return alert('Add meg a keresendő nevet!'); }

  const req = new XMLHttpRequest();
  req.open('POST', `${API_URL}/productsearchname`);
  req.setRequestHeader('Content-Type','application/json');
  req.send(JSON.stringify({ name }));

  req.onreadystatechange = () => {
    if (req.readyState === 4) {
      const resp = JSON.parse(req.response);
      if (req.status === 200 && !resp.message) {
        alert(`ID: ${resp.id}\nNév: ${resp.name}\nTípus: ${resp.type}\nÁr: ${resp.price}`);
      } else {
        alert(resp.message || 'Hiba a név szerinti keresés során');
      }
    }
  };
}


//
// Második hét
//

// 1. rész (Lengyel Dániel)

function Create() {
    const createWH = new XMLHttpRequest();
    createWH.open('POST', `${API_URL}/warehouses`);
    createWH.setRequestHeader('Content-Type', 'application/json');
    const data = {
        name: WHname.value,
        location: WHlocation.value,
        capacity: WHcapacity.value,
        manager_name: WHmanager_name.value,
        notes: WHnotes.value,
    };
    createWH.send(JSON.stringify(data));
    createWH.onreadystatechange = () => {
        if (createWH.readyState == 4) {
            const res = JSON.parse(createWH.responseText);
            alert(res.message);
            console.log(res);
        }
    };
}


function List() {
    const lister = new XMLHttpRequest();
    lister.open('GET', `${API_URL}/warehouses`);
    lister.onreadystatechange = () => {
        if (lister.readyState == 4) {
            if(lister.status == 200){
                const warehouses = JSON.parse(lister.responseText);
                const list = document.getElementById('warehouseList');
                list.innerHTML = '';
                warehouses.forEach(wh => {
                    const row = document.createElement('div');
                    row.className = 'product-item';
                    row.textContent = `${wh.id}. ${wh.name} (${wh.location})`;
                    list.appendChild(row);
                });
            }
            else if (lister.status == 404) {
                alert("Hiba.");
            } else {
                alert(`Hiba: ${lister.status}`);
            }
        }
    };
    lister.send();
}

function Details(id) {
    if (!id) {
        alert("Kérlek, adj meg ID-t!");
        return;
    }
    const detailsS = new XMLHttpRequest();
    detailsS.open('GET', `${API_URL}/warehouses/${id}`);
    detailsS.onreadystatechange = () => {
        if (detailsS.readyState == 4) {
            if (detailsS.status == 200) {
                const wh = JSON.parse(detailsS.responseText);
                alert(
                    `Raktár részletei:\n` +
                    `Név: ${wh.name}\n` +
                    `Helyszín: ${wh.location}\n` +
                    `Kapacitás: ${wh.capacity}\n` +
                    `Vezető: ${wh.manager_name}\n` +
                    `Megjegyzés: ${wh.notes || '—'}`
                );
            } else if (detailsS.status == 404) {
                alert("Nem található ilyen raktár.");
            } else {
                alert(`Hiba történt: ${detailsS.status}`);
            }
        }
    };
    detailsS.send();
}


// 2. rész (Komjáti Gábor)

function AssignProductToWarehouse() {
    const warehouseId = document.getElementById('assignWarehouseId').value;
    const productName = document.getElementById('assignProductName').value;
    const amount = document.getElementById('assignAmount').value;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/warehouses/${warehouseId}/products`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    const data = {
        name: productName,
        amount: parseInt(amount)
    };
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            const res = JSON.parse(xhr.responseText);
            alert(res.message);
            console.log(res);
        }
    };
    xhr.send(JSON.stringify(data));
}

function ListInventoryByWarehouse() {
    const warehouseId = document.getElementById('inventoryWarehouseId').value;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${API_URL}/warehouses/${warehouseId}/inventory`);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const products = JSON.parse(xhr.responseText);
                const list = document.getElementById('inventoryList');
                list.innerHTML = '';
                products.forEach(p => {
                    const row = document.createElement('div');
                    row.className = 'product-item';
                    row.textContent = `Id: ${p.id}, Name: ${p.name}, Amount: ${p.amount}`;
                    list.appendChild(row);
                });
            } else {
                const res = JSON.parse(xhr.responseText);
                alert(res.message);
            }
        }
    };
    xhr.send();
}

function UpdateInventory() {
    const productId = document.getElementById('updateProductId').value;
    const newAmount = document.getElementById('updateAmount').value;

    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `${API_URL}/inventory/${productId}`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    const data = {
        amount: parseInt(newAmount)
    };
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            const res = JSON.parse(xhr.responseText);
            alert(res.message);
            console.log(res);
        }
    };
    xhr.send(JSON.stringify(data));
}


// 3. rész (Potyondi Zsombor)

function DeleteStock(id){
    const deleteStockRequest = new XMLHttpRequest()
    deleteStockRequest.open('delete', `${API_URL}/inventory/${id}`)
    deleteStockRequest.onreadystatechange = () => {
        if(deleteStockRequest.readyState == 4){
            const result = JSON.parse(deleteStockRequest.response);
            console.log(result.message);
            alert(result.message);
        }
    }
    deleteStockRequest.send();
}

function FilterStock(warehouse){
    const filterStockRequest = new XMLHttpRequest()
    filterStockRequest.open('get', `${API_URL}/products/warehouse/${warehouse}`)
    filterStockRequest.onreadystatechange = () => {
        if(filterStockRequest.readyState == 4){
            if(filterStockRequest.status == 200){
                const items = JSON.parse(filterStockRequest.response);
                const list = document.getElementById('itemList');
                list.innerHTML = '';
                items.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'product-item';
                    row.textContent = `Id: ${item.id}, Name: ${item.name}, Warehouse id: ${item.warehouseId}, Amount: ${item.amount}, Type: ${item.type}, Price: ${item.price}`;
                    list.appendChild(row);
                })
            }
            else{
                const result = JSON.parse(filterStockRequest.response);
                console.log(result.message);
                alert(result.message);
            }
        }
    }
    filterStockRequest.send();
}

function ListLowStock(){
    const lowStockRequest = new XMLHttpRequest()
    lowStockRequest.open('get', `${API_URL}/products/lowStock`)
    lowStockRequest.onreadystatechange = () => {
        if(lowStockRequest.readyState == 4){
            if(lowStockRequest.status == 200){
                const items = JSON.parse(lowStockRequest.response);
                const list = document.getElementById('stockList');
                list.innerHTML = '';
                items.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'product-item';
                    row.textContent = `Id: ${item.id}, Name: ${item.name}, Warehouse id: ${item.warehouseId}, Amount: ${item.amount}, Type: ${item.type}, Price: ${item.price}`;
                    list.appendChild(row);
                })
            }
            else{
                const result = JSON.parse(lowStockRequest.response);
                console.log(result.message);
                alert(result.message);
            }
        }
    }
    lowStockRequest.send();
}

// === Harmadik hét kódja ===

function recordMovementIn() {
    const productId = document.getElementById('inProductId').value;
    const warehouseId = document.getElementById('inWarehouseId').value;
    const quantity = document.getElementById('inQuantity').value;

    if (!productId || !warehouseId || !quantity) {
        return alert('Minden mezőt ki kell tölteni a bevételezéshez!');
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/movements/in`);
    xhr.setRequestHeader('Content-Type', 'application/json');

    const data = {
        productId: parseInt(productId),
        warehouseId: parseInt(warehouseId),
        quantity: parseInt(quantity)
    };

    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            const res = JSON.parse(xhr.responseText);
            alert(res.message);
        }
    };

    xhr.send(JSON.stringify(data));
}

function recordMovementOut() {
    const productId = document.getElementById('outProductId').value;
    const warehouseId = document.getElementById('outWarehouseId').value;
    const quantity = document.getElementById('outQuantity').value;

    if (!productId || !warehouseId || !quantity) {
        return alert('Minden mezőt ki kell tölteni a kivételezéshez!');
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/movements/out`);
    xhr.setRequestHeader('Content-Type', 'application/json');

    const data = {
        productId: parseInt(productId),
        warehouseId: parseInt(warehouseId),
        quantity: parseInt(quantity)
    };

    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            const res = JSON.parse(xhr.responseText);
            alert(res.message);
        }
    };

    xhr.send(JSON.stringify(data));
}

function listMovements() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${API_URL}/movements`);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const movements = JSON.parse(xhr.responseText);
                displayMovements(movements, 'movementsList');
            } else {
                const res = JSON.parse(xhr.responseText);
                alert('Hiba a mozgások listázása közben: ' + res.message);
            }
        }
    };
    xhr.send();
}

function displayMovements(movements, containerId) {
    const listContainer = document.getElementById(containerId);
    listContainer.innerHTML = '';

    if (movements.length === 0) {
        listContainer.textContent = 'Nincs a feltételeknek megfelelő mozgás.';
        return;
    }
    
    movements.forEach(m => {
        const row = document.createElement('div');
        row.className = 'product-item';
        
        const typeText = m.type === 'in' ? 'Bevételezés' : 'Kivételezés';
        const productName = (m.productInfo ? m.productInfo.name : m.product?.name) || `Termék ID: ${m.productId}`;
        const warehouseName = (m.warehouse ? m.warehouse.name : `Raktár ID: ${m.warehouseId}`);
        const date = new Date(m.createdAt).toLocaleString('hu-HU');

        row.textContent = `ID: ${m.id} | [${date}] ${typeText} | Termék: ${productName} | Raktár: ${warehouseName} | Mennyiség: ${m.quantity} db`;
        
        row.style.color = m.type === 'in' ? 'green' : 'red';
        
        listContainer.appendChild(row);
    });
}

function getMovementById() {
    const id = document.getElementById('searchMovementId').value;
    if (!id) {
        alert('Kérlek, adj meg egy mozgás ID-t!');
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${API_URL}/movements/${id}`);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const movement = JSON.parse(xhr.responseText);
                displayMovements([movement], 'movementFilterResults');
            } else {
                const res = JSON.parse(xhr.responseText);
                document.getElementById('movementFilterResults').textContent = `Hiba: ${res.message}`;
            }
        }
    };
    xhr.send();
}

function filterMovements() {
    const type = document.getElementById('filterMovementType').value;
    const date = document.getElementById('filterMovementDate').value;
    let url;

    if (date) {
        url = `${API_URL}/movements/date/${date}`;
    } else {
        url = `${API_URL}/movements?type=${type}`;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const movements = JSON.parse(xhr.responseText);
                displayMovements(movements, 'movementFilterResults');
            } else {
                const res = JSON.parse(xhr.responseText);
                document.getElementById('movementFilterResults').textContent = `Hiba: ${res.message}`;
            }
        }
    };
    xhr.send();
}


/**
 * Elküld egy kérést a szervernek egy adott mozgás visszavonására.
 */
function undoMovement() {
    const id = document.getElementById('undoMovementId').value;
    if (!id) {
        return alert('Kérlek, add meg a visszavonandó mozgás ID-ját!');
    }

    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', `${API_URL}/movements/${id}`);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            const res = JSON.parse(xhr.responseText);
            alert(res.message);
            // Sikeres visszavonás után frissítjük a teljes mozgáslistát
            if (xhr.status === 200) {
                listMovements();
            }
        }
    };
    xhr.send();
}

/**
 * Megnyit egy új böngészőablakot, amely elindítja a CSV export letöltését.
 */
function exportMovementsToCsv() {
    window.open(`${API_URL}/movements/export`, '_blank');
}

/**
 * Lekéri és megjeleníti egy adott termék mozgásainak statisztikáját.
 */
function getProductMovementStats() {
    const id = document.getElementById('statsProductId').value;
    const resultDiv = document.getElementById('productStatsResult');
    resultDiv.innerHTML = 'Betöltés...';

    if (!id) {
        resultDiv.innerHTML = 'Kérlek, adj meg egy termék ID-t!';
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${API_URL}/products/${id}/movements/stats`);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            const res = JSON.parse(xhr.responseText);
            if (xhr.status === 200) {
                if(res.message && !res.movementCount){ // Ha a szerver üzenetet küld (pl. nincs mozgás)
                    resultDiv.innerHTML = `<strong>${res.productName} (ID: ${res.productId})</strong><br>${res.message}`;
                    return;
                }
                
                resultDiv.innerHTML = `
                    <strong>Statisztika: ${res.productName} (ID: ${res.productId})</strong><br>
                    Összes bevételezés: <strong>${res.totalIn} db</strong><br>
                    Összes kivételezés: <strong>${res.totalOut} db</strong><br>
                    Nettó változás: <strong>${res.netChange} db</strong><br>
                    Mozgások száma: <strong>${res.movementCount}</strong><br>
                    Első mozgás: <em>${new Date(res.firstMovementDate).toLocaleString('hu-HU')}</em><br>
                    Utolsó mozgás: <em>${new Date(res.lastMovementDate).toLocaleString('hu-HU')}</em>
                `;
            } else {
                resultDiv.innerHTML = `<span style="color: red;">Hiba: ${res.message}</span>`;
            }
        }
    };
    xhr.send();
}

