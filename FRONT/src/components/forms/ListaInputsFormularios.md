## HuertoData (para registros de agua, siembra, abono y plagas)
- input: fecha (date)
- input: cantidad (number) [agua]
- input: siembra (number) [siembra]
- input: cosecha (number) [siembra]
- input: fechaFinal (date) [siembra, abono, plagas]
- input: fechaInicio (date) [abono, plagas]
- input: totalDias (number) [abono]
- input: cantidadAbono (number) [abono]
- input: cantidadPlagas (number) [plagas]
## AddProveedorModal.jsx
- input: nombreProducto (text)
- textarea: descripcion
- select: categoria
- input: precio (number)
- input: nombreProveedor (text)
- input: direccion (text)
- input: contacto (tel)
- input: horario (text)
- input: etiquetas (text)
- input: autor (text)
## AddInventoryModal.jsx
- input: title (text)
- textarea: description
- select: category
- input: stock (number)
- input: price (number)
- input: location (text)
- input: tags (text)
- input: author (text)
# Lista de Inputs de Formularios
## SignUpForm.jsx
- input: nombre (text)
- input: cedula (text)
- input: telefono (tel)
- select: preferencias_cultivo
- input: calle (text)
- input: ciudad (text)
- input: estado (text)
- input: pais (text)
- input: latitud (hidden/text)
- input: longitud (hidden/text)
- input: email (email)
- input: password (password)

## SignInForm.jsx
- input: email (email)
- input: password (password)
- input: I forgot my password(button)

## AlertForm.jsx
- input: title (text)
- textarea: description
- select: type
- select: priority
- select: gardenId
- select: targetUsers
- input: scheduledDate (datetime-local)
- input: isActive (checkbox)
- textarea: notes

## CommentForm.jsx
- input: id (number)
- input: title (text)
- textarea: description
- select: category
- input: author (text)
- input: date (date)
- input: tags (text/multivalue)

## InventoryForm.jsx
- input: name (text)
- textarea: description
- select: category
- select: status
- input: quantity (number)
- select: unit
- input: currentStock (number)
- input: minStock (number)
- input: cost (number)
- input: location (text)
- select: providerId
- textarea: notes

## SearchBar.jsx
- input: searchTerm (text)

## GardenModal.jsx
- input: nombre (text)
- input: ubicacion (text)
- input: superficie (text)
- select: tipo
- textarea: descripcion
