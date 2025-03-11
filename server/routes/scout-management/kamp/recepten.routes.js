const express = require('express');
const DbService = require('../../../db/services/db.service');
const router = express.Router();

// Apply authentication middleware to all routes

/**
 * Get all recipes
 */
router.get('/', async (req, res) => {
  try {
    const recipes = await DbService.query('SELECT * FROM Recept ORDER BY Naam');
    res.json(recipes);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Get a specific recipe by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const recept = await DbService.queryOne('SELECT * FROM Recept WHERE ReceptID = ?', [id]);
    
    if (!recept) {
      return res.status(404).json({ error: 'Recept niet gevonden' });
    }
    
    // Get ingredients for this recipe with associated base ingredient info
    const ingredienten = await DbService.query(
      `SELECT ri.*, i.Naam as BasisNaam, i.Eenheid_Standaard, i.Categorie
       FROM Recept_Ingredienten ri
       LEFT JOIN Ingredienten i ON ri.IngredientBasisID = i.IngredientBasisID
       WHERE ri.ReceptID = ?`,
      [id]
    );
    
    // Include structured ingredients in the recipe object
    recept.StructuredIngredienten = ingredienten || [];
    res.json(recept);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Create a new recipe
 */
router.post('/', async (req, res) => {
  try {
    const { 
      Naam, 
      Heeft_Vega_Optie, 
      Allergieën, 
      Moeilijkheidsgraad, 
      Bereidingstijd, 
      Opmerkingen,
      StructuredIngredienten // New field for structured ingredients
    } = req.body;
    
    try {
      await DbService.beginTransaction();
      
      // Insert the recipe
      const receptResult = await DbService.create('Recept', {
        Naam,
        Heeft_Vega_Optie,
        Allergieën,
        Moeilijkheidsgraad,
        Bereidingstijd,
        Opmerkingen
      });
      
      const receptId = receptResult.id;
      
      // If there are structured ingredients, insert them
      if (StructuredIngredienten && Array.isArray(StructuredIngredienten) && StructuredIngredienten.length > 0) {
        for (const ingredient of StructuredIngredienten) {
          // Check if the base ingredient exists
          let basisIngredient = await DbService.queryOne(
            'SELECT IngredientBasisID FROM Ingredienten WHERE Naam = ?',
            [ingredient.Naam]
          );
          
          let basisId;
          
          if (basisIngredient) {
            // Ingredient exists, use its ID
            basisId = basisIngredient.IngredientBasisID;
          } else {
            // Need to create the base ingredient first
            const newIngredient = await DbService.create('Ingredienten', {
              Naam: ingredient.Naam,
              Eenheid_Standaard: ingredient.Eenheid,
              Categorie: ingredient.Categorie || null
            });
            
            basisId = newIngredient.id;
          }
          
          // Add recipe ingredient with the base ingredient ID
          await DbService.create('Recept_Ingredienten', {
            ReceptID: receptId,
            IngredientBasisID: basisId,
            Hoeveelheid: ingredient.Hoeveelheid,
            Eenheid: ingredient.Eenheid
          });
        }
      }
      
      await DbService.commit();
      
      // Get the complete recipe with ingredients
      const newRecept = await DbService.queryOne(
        'SELECT * FROM Recept WHERE ReceptID = ?', 
        [receptId]
      );
      
      const ingredienten = await DbService.query(
        `SELECT ri.*, i.Naam as BasisNaam, i.Eenheid_Standaard, i.Categorie
         FROM Recept_Ingredienten ri
         LEFT JOIN Ingredienten i ON ri.IngredientBasisID = i.IngredientBasisID
         WHERE ri.ReceptID = ?`,
        [receptId]
      );
      
      // Include structured ingredients in the recipe object
      newRecept.StructuredIngredienten = ingredienten || [];
      res.status(201).json(newRecept);
      
    } catch (err) {
      await DbService.rollback();
      throw err;
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Update an existing recipe
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      Naam, 
      Heeft_Vega_Optie, 
      Allergieën, 
      Moeilijkheidsgraad, 
      Bereidingstijd, 
      Opmerkingen,
      StructuredIngredienten // New field for structured ingredients
    } = req.body;
    
    try {
      await DbService.beginTransaction();
      
      // Check if recipe exists
      const recept = await DbService.queryOne('SELECT * FROM Recept WHERE ReceptID = ?', [id]);
      
      if (!recept) {
        await DbService.rollback();
        return res.status(404).json({ error: 'Recept niet gevonden' });
      }
      
      // Update the recipe
      await DbService.update('Recept', 'ReceptID', id, {
        Naam,
        Heeft_Vega_Optie,
        Allergieën,
        Moeilijkheidsgraad,
        Bereidingstijd,
        Opmerkingen
      });
      
      // Delete existing ingredients for this recipe
      await DbService.query('DELETE FROM Recept_Ingredienten WHERE ReceptID = ?', [id]);
      
      // If there are structured ingredients, insert them
      if (StructuredIngredienten && Array.isArray(StructuredIngredienten) && StructuredIngredienten.length > 0) {
        for (const ingredient of StructuredIngredienten) {
          // Check if the base ingredient exists
          let basisIngredient = await DbService.queryOne(
            'SELECT IngredientBasisID FROM Ingredienten WHERE Naam = ?',
            [ingredient.Naam]
          );
          
          let basisId;
          
          if (basisIngredient) {
            // Ingredient exists, use its ID
            basisId = basisIngredient.IngredientBasisID;
          } else {
            // Need to create the base ingredient first
            const newIngredient = await DbService.create('Ingredienten', {
              Naam: ingredient.Naam,
              Eenheid_Standaard: ingredient.Eenheid,
              Categorie: ingredient.Categorie || null
            });
            
            basisId = newIngredient.id;
          }
          
          // Add recipe ingredient with the base ingredient ID
          await DbService.create('Recept_Ingredienten', {
            ReceptID: id,
            IngredientBasisID: basisId,
            Hoeveelheid: ingredient.Hoeveelheid,
            Eenheid: ingredient.Eenheid
          });
        }
      }
      
      await DbService.commit();
      
      // Get the updated recipe with ingredients
      const updatedRecept = await DbService.queryOne(
        'SELECT * FROM Recept WHERE ReceptID = ?', 
        [id]
      );
      
      const ingredienten = await DbService.query(
        `SELECT ri.*, i.Naam as BasisNaam, i.Eenheid_Standaard, i.Categorie
         FROM Recept_Ingredienten ri
         LEFT JOIN Ingredienten i ON ri.IngredientBasisID = i.IngredientBasisID
         WHERE ri.ReceptID = ?`,
        [id]
      );
      
      // Include structured ingredients in the recipe object
      updatedRecept.StructuredIngredienten = ingredienten || [];
      res.json(updatedRecept);
      
    } catch (err) {
      await DbService.rollback();
      throw err;
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Duplicate an existing recipe
 */
router.post('/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    
    try {
      await DbService.beginTransaction();
      
      // First, get the recipe we want to duplicate
      const recept = await DbService.queryOne('SELECT * FROM Recept WHERE ReceptID = ?', [id]);
      
      if (!recept) {
        await DbService.rollback();
        return res.status(404).json({ error: 'Recept niet gevonden' });
      }
      
      // Create new recipe with name indicating it's a copy
      const newName = `${recept.Naam} (kopie)`;
      
      const newReceptResult = await DbService.create('Recept', {
        Naam: newName,
        Heeft_Vega_Optie: recept.Heeft_Vega_Optie,
        Allergieën: recept.Allergieën,
        Moeilijkheidsgraad: recept.Moeilijkheidsgraad,
        Bereidingstijd: recept.Bereidingstijd,
        Opmerkingen: recept.Opmerkingen
      });
      
      const newReceptId = newReceptResult.id;
      
      // Now copy all ingredients from the original recipe
      const ingredienten = await DbService.query(
        `SELECT ri.*, i.Naam, i.Categorie
         FROM Recept_Ingredienten ri
         JOIN Ingredienten i ON ri.IngredientBasisID = i.IngredientBasisID
         WHERE ri.ReceptID = ?`, 
        [id]
      );
      
      if (ingredienten && ingredienten.length > 0) {
        for (const ingredient of ingredienten) {
          // Directly use the existing IngredientBasisID since we're duplicating
          await DbService.create('Recept_Ingredienten', {
            ReceptID: newReceptId,
            IngredientBasisID: ingredient.IngredientBasisID,
            Hoeveelheid: ingredient.Hoeveelheid,
            Eenheid: ingredient.Eenheid
          });
        }
      }
      
      await DbService.commit();
      
      // Return the new recipe with its ingredients
      const newRecept = await DbService.queryOne(
        'SELECT * FROM Recept WHERE ReceptID = ?', 
        [newReceptId]
      );
      
      const newIngredienten = await DbService.query(
        `SELECT ri.*, i.Naam as BasisNaam, i.Eenheid_Standaard, i.Categorie
         FROM Recept_Ingredienten ri
         LEFT JOIN Ingredienten i ON ri.IngredientBasisID = i.IngredientBasisID
         WHERE ri.ReceptID = ?`,
        [newReceptId]
      );
      
      newRecept.StructuredIngredienten = newIngredienten || [];
      res.status(201).json(newRecept);
      
    } catch (err) {
      await DbService.rollback();
      throw err;
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Delete a recipe
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check for related records in Maaltijden table
    const relatedMeals = await DbService.queryOne(
      'SELECT COUNT(*) as count FROM Maaltijden WHERE ReceptID = ?',
      [id]
    );
    
    if (relatedMeals && relatedMeals.count > 0) {
      return res.status(400).json({ 
        error: 'Dit recept is in gebruik bij maaltijden en kan niet worden verwijderd' 
      });
    }
    
    try {
      await DbService.beginTransaction();
      
      // First delete all ingredient associations
      await DbService.query('DELETE FROM Recept_Ingredienten WHERE ReceptID = ?', [id]);
      
      // Then delete the recipe itself
      const deleteResult = await DbService.delete('Recept', 'ReceptID', id);
      
      if (deleteResult.notFound) {
        await DbService.rollback();
        return res.status(404).json({ error: 'Recept niet gevonden' });
      }
      
      await DbService.commit();
      res.json({ success: true, message: 'Recept verwijderd' });
      
    } catch (err) {
      await DbService.rollback();
      throw err;
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint to get all base ingredients
router.get('/ingredients/base', async (req, res) => {
  try {
    const ingredients = await DbService.query('SELECT * FROM Ingredienten ORDER BY Naam');
    res.json(ingredients);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
