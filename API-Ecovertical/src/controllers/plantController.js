export const registerPlant = (req, res) => {
  res.status(201).json({ message: 'Planta registrada' });
};

export const getPlantsByGarden = (req, res) => {
  res.json({ message: 'Plantas por jardín', gardenId: req.params.gardenId });
};

export const getPlantDetails = (req, res) => {
  res.json({ message: 'Detalle de planta', plantId: req.params.plantId });
};

export const updatePlant = (req, res) => {
  res.json({ message: 'Planta actualizada', plantId: req.params.plantId });
};

export const deletePlant = (req, res) => {
  res.json({ message: 'Planta eliminada', plantId: req.params.plantId });
};

export const recordWatering = (req, res) => {
  res.status(201).json({ message: 'Riego registrado', plantId: req.params.plantId });
};

export const getWateringHistory = (req, res) => {
  res.json({ message: 'Historial de riego', plantId: req.params.plantId });
};

export const recordHarvest = (req, res) => {
  res.status(201).json({ message: 'Cosecha registrada', plantId: req.params.plantId });
};
