const express = require('express');
const database = require('../../db');
const router = express.Router();

// Apply authentication middleware to all routes

/**
 * Get all recipes
 */
router.get('/', async (req, res) => {
  try {
    const db = database.instance;
    db.all(
      'SELECT * FROM Recept ORDER BY Naam',
      [],
      (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
      }
    );
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
    const db = database.instance;
    
    db.get(
      'SELECT * FROM Recept WHERE ReceptID = ?',
      [id],
      (err, recept) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (!recept) {
          return res.status(404).json({ error: 'Recept niet gevonden' });
        }
        
        // Get ingredients for this recipe with associated base ingredient info
        db.all(
          `SELECT ri.*, i.Naam as BasisNaam, i.Eenheid_Standaard, i.Categorie
           FROM Recept_Ingredienten ri
           LEFT JOIN Ingredienten i ON ri.IngredientBasisID = i.IngredientBasisID
           WHERE ri.ReceptID = ?`,
          [id],
          (err, ingredienten) => {
            if (err) {
              console.error('Database error fetching ingredients:', err);
              return res.status(500).json({ error: 'Database error' });
            }
            
            // Include structured ingredients in the recipe object
            recept.StructuredIngredienten = ingredienten || [];
            res.json(recept);
          }
        );
      }
    );
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
    const db = database.instance;
    
    // Start a transaction to ensure data consistency
    db.run('BEGIN TRANSACTION', (err) => {
      if (err) {
        console.error('Failed to begin transaction:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Insert the recipe
      db.run(
        `INSERT INTO Recept 
        (Naam, Heeft_Vega_Optie, Allergieën, Moeilijkheidsgraad, Bereidingstijd, Opmerkingen) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [Naam, Heeft_Vega_Optie, Allergieën, Moeilijkheidsgraad, Bereidingstijd, Opmerkingen],
        function(err) {
          if (err) {
            db.run('ROLLBACK', () => {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Database error' });
            });
            return;
          }
          
          const receptId = this.lastID;
          
          // If there are structured ingredients, insert them
          if (StructuredIngredienten && Array.isArray(StructuredIngredienten) && StructuredIngredienten.length > 0) {
            let completed = 0;
            let hasErrors = false;
            
            StructuredIngredienten.forEach((ingredient, index) => {
              // First check if the base ingredient exists or create it
              db.get(
                'SELECT IngredientBasisID FROM Ingredienten WHERE Naam = ?',
                [ingredient.Naam],
                (err, basisIngredient) => {
                  if (err) {
                    if (!hasErrors) {
                      hasErrors = true;
                      db.run('ROLLBACK', () => {
                        console.error('Database error finding ingredient:', err);
                        return res.status(500).json({ error: 'Database error' });
                      });
                    }
                    return;
                  }
                  
                  // Function to add recipe ingredient once we have the base ingredient ID
                  const addRecipeIngredient = (basisId) => {
                    db.run(
                      `INSERT INTO Recept_Ingredienten
                      (ReceptID, IngredientBasisID, Hoeveelheid, Eenheid)
                      VALUES (?, ?, ?, ?)`,
                      [
                        receptId,
                        basisId,
                        ingredient.Hoeveelheid,
                        ingredient.Eenheid
                      ],
                      (err) => {
                        if (err && !hasErrors) {
                          hasErrors = true;
                          db.run('ROLLBACK', () => {
                            console.error('Database error inserting ingredient:', err);
                            return res.status(500).json({ error: 'Error adding ingredients' });
                          });
                          return;
                        }
                        
                        completed++;
                        
                        // If all ingredients have been processed, complete the transaction
                        if (completed === StructuredIngredienten.length && !hasErrors) {
                          completeTransaction(receptId);
                        }
                      }
                    );
                  };
                  
                  if (basisIngredient) {
                    // Ingredient exists, use its ID
                    addRecipeIngredient(basisIngredient.IngredientBasisID);
                  } else {
                    // Need to create the base ingredient first
                    db.run(
                      `INSERT INTO Ingredienten (Naam, Eenheid_Standaard, Categorie)
                       VALUES (?, ?, ?)`,
                      [
                        ingredient.Naam,
                        ingredient.Eenheid,
                        ingredient.Categorie || null
                      ],
                      function(err) {
                        if (err && !hasErrors) {
                          hasErrors = true;
                          db.run('ROLLBACK', () => {
                            console.error('Database error creating ingredient:', err);
                            return res.status(500).json({ error: 'Error creating base ingredient' });
                          });
                          return;
                        }
                        
                        // Now add the recipe ingredient with the new base ingredient ID
                        addRecipeIngredient(this.lastID);
                      }
                    );
                  }
                }
              );
            });
          } else {
            // No ingredients to add, complete transaction
            completeTransaction(receptId);
          }
          
          function completeTransaction(receptId) {
            db.run('COMMIT', (err) => {
              if (err) {
                db.run('ROLLBACK', () => {
                  console.error('Error committing transaction:', err);
                  return res.status(500).json({ error: 'Database error' });
                });
                return;
              }
              
              // Get the complete recipe with ingredients
              db.get(
                'SELECT * FROM Recept WHERE ReceptID = ?',
                [receptId],
                (err, newRecept) => {
                  if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error' });
                  }
                  
                  db.all(
                    `SELECT ri.*, i.Naam as BasisNaam, i.Eenheid_Standaard, i.Categorie
                     FROM Recept_Ingredienten ri
                     LEFT JOIN Ingredienten i ON ri.IngredientBasisID = i.IngredientBasisID
                     WHERE ri.ReceptID = ?`,
                    [receptId],
                    (err, ingredienten) => {
                      if (err) {
                        console.error('Database error fetching ingredients:', err);
                        return res.status(500).json({ error: 'Database error' });
                      }
                      
                      // Include structured ingredients in the recipe object
                      newRecept.StructuredIngredienten = ingredienten || [];
                      res.status(201).json(newRecept);
                    }
                  );
                }
              );
            });
          }
        }
      );
    });
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
    const db = database.instance;
    
    // Start transaction
    db.run('BEGIN TRANSACTION', (err) => {
      if (err) {
        console.error('Failed to begin transaction:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Check if recipe exists
      db.get(
        'SELECT * FROM Recept WHERE ReceptID = ?',
        [id],
        (err, recept) => {
          if (err) {
            db.run('ROLLBACK');
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          
          if (!recept) {
            db.run('ROLLBACK');
            return res.status(404).json({ error: 'Recept niet gevonden' });
          }
          
          // Update the recipe
          db.run(
            `UPDATE Recept 
            SET Naam = ?, Heeft_Vega_Optie = ?, 
                Allergieën = ?, Moeilijkheidsgraad = ?, Bereidingstijd = ?, Opmerkingen = ?
            WHERE ReceptID = ?`,
            [Naam, Heeft_Vega_Optie, Allergieën, Moeilijkheidsgraad, Bereidingstijd, Opmerkingen, id],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                console.error('Database error updating recipe:', err);
                return res.status(500).json({ error: 'Database error' });
              }
              
              // Delete existing ingredients for this recipe
              db.run(
                'DELETE FROM Recept_Ingredienten WHERE ReceptID = ?',
                [id],
                function(err) {
                  if (err) {
                    db.run('ROLLBACK');
                    console.error('Database error deleting ingredients:', err);
                    return res.status(500).json({ error: 'Database error' });
                  }
                  
                  // If there are structured ingredients, insert them
                  if (StructuredIngredienten && Array.isArray(StructuredIngredienten) && StructuredIngredienten.length > 0) {
                    let completed = 0;
                    let hasErrors = false;
                    
                    StructuredIngredienten.forEach((ingredient, index) => {
                      // First check if the base ingredient exists or create it
                      db.get(
                        'SELECT IngredientBasisID FROM Ingredienten WHERE Naam = ?',
                        [ingredient.Naam],
                        (err, basisIngredient) => {
                          if (err) {
                            if (!hasErrors) {
                              hasErrors = true;
                              db.run('ROLLBACK', () => {
                                console.error('Database error finding ingredient:', err);
                                return res.status(500).json({ error: 'Database error' });
                              });
                            }
                            return;
                          }
                          
                          // Function to add recipe ingredient once we have the base ingredient ID
                          const addRecipeIngredient = (basisId) => {
                            db.run(
                              `INSERT INTO Recept_Ingredienten
                              (ReceptID, IngredientBasisID, Hoeveelheid, Eenheid)
                              VALUES (?, ?, ?, ?)`,
                              [
                                id,
                                basisId,
                                ingredient.Hoeveelheid,
                                ingredient.Eenheid
                              ],
                              (err) => {
                                if (err && !hasErrors) {
                                  hasErrors = true;
                                  db.run('ROLLBACK', () => {
                                    console.error('Database error inserting ingredient:', err);
                                    return res.status(500).json({ error: 'Error updating ingredients' });
                                  });
                                  return;
                                }
                                
                                completed++;
                                
                                // If all ingredients have been processed, complete the transaction
                                if (completed === StructuredIngredienten.length && !hasErrors) {
                                  completeTransaction();
                                }
                              }
                            );
                          };
                          
                          if (basisIngredient) {
                            // Ingredient exists, use its ID
                            addRecipeIngredient(basisIngredient.IngredientBasisID);
                          } else {
                            // Need to create the base ingredient first
                            db.run(
                              `INSERT INTO Ingredienten (Naam, Eenheid_Standaard, Categorie)
                               VALUES (?, ?, ?)`,
                              [
                                ingredient.Naam,
                                ingredient.Eenheid,
                                ingredient.Categorie || null
                              ],
                              function(err) {
                                if (err && !hasErrors) {
                                  hasErrors = true;
                                  db.run('ROLLBACK', () => {
                                    console.error('Database error creating ingredient:', err);
                                    return res.status(500).json({ error: 'Error creating base ingredient' });
                                  });
                                  return;
                                }
                                
                                // Now add the recipe ingredient with the new base ingredient ID
                                addRecipeIngredient(this.lastID);
                              }
                            );
                          }
                        }
                      );
                    });
                  } else {
                    // No ingredients to add, complete transaction
                    completeTransaction();
                  }
                }
              );
              
              function completeTransaction() {
                db.run('COMMIT', (err) => {
                  if (err) {
                    db.run('ROLLBACK', () => {
                      console.error('Error committing transaction:', err);
                      return res.status(500).json({ error: 'Database error' });
                    });
                    return;
                  }
                  
                  // Get the updated recipe with ingredients
                  db.get(
                    'SELECT * FROM Recept WHERE ReceptID = ?',
                    [id],
                    (err, updatedRecept) => {
                      if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ error: 'Database error' });
                      }
                      
                      db.all(
                        `SELECT ri.*, i.Naam as BasisNaam, i.Eenheid_Standaard, i.Categorie
                         FROM Recept_Ingredienten ri
                         LEFT JOIN Ingredienten i ON ri.IngredientBasisID = i.IngredientBasisID
                         WHERE ri.ReceptID = ?`,
                        [id],
                        (err, ingredienten) => {
                          if (err) {
                            console.error('Database error fetching ingredients:', err);
                            return res.status(500).json({ error: 'Database error' });
                          }
                          
                          // Include structured ingredients in the recipe object
                          updatedRecept.StructuredIngredienten = ingredienten || [];
                          res.json(updatedRecept);
                        }
                      );
                    }
                  );
                });
              }
            }
          );
        }
      );
    });
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
    const db = database.instance;
    
    // Begin transaction
    db.run('BEGIN TRANSACTION', (err) => {
      if (err) {
        console.error('Failed to begin transaction:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // First, get the recipe we want to duplicate
      db.get('SELECT * FROM Recept WHERE ReceptID = ?', [id], (err, recept) => {
        if (err) {
          db.run('ROLLBACK');
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (!recept) {
          db.run('ROLLBACK');
          return res.status(404).json({ error: 'Recept niet gevonden' });
        }
        
        // Create new recipe with name indicating it's a copy
        const newName = `${recept.Naam} (kopie)`;
        
        db.run(
          `INSERT INTO Recept 
          (Naam, Heeft_Vega_Optie, Allergieën, Moeilijkheidsgraad, Bereidingstijd, Opmerkingen) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [newName, recept.Heeft_Vega_Optie, recept.Allergieën, recept.Moeilijkheidsgraad, 
           recept.Bereidingstijd, recept.Opmerkingen],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Database error' });
            }
            
            const newReceptId = this.lastID;
            
            // Now copy all ingredients from the original recipe
            db.all(
              `SELECT ri.*, i.Naam, i.Categorie
               FROM Recept_Ingredienten ri
               JOIN Ingredienten i ON ri.IngredientBasisID = i.IngredientBasisID
               WHERE ri.ReceptID = ?`, 
              [id], 
              (err, ingredienten) => {
              if (err) {
                db.run('ROLLBACK');
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
              }
              
              if (!ingredienten || ingredienten.length === 0) {
                // No ingredients to copy, complete transaction
                completeTransaction(newReceptId);
                return;
              }
              
              let completed = 0;
              let hasErrors = false;
              
              ingredienten.forEach(ingredient => {
                // Directly use the existing IngredientBasisID since we're duplicating
                db.run(
                  `INSERT INTO Recept_Ingredienten
                  (ReceptID, IngredientBasisID, Hoeveelheid, Eenheid)
                  VALUES (?, ?, ?, ?)`,
                  [
                    newReceptId,
                    ingredient.IngredientBasisID,
                    ingredient.Hoeveelheid,
                    ingredient.Eenheid
                  ],
                  (err) => {
                    if (err && !hasErrors) {
                      hasErrors = true;
                      db.run('ROLLBACK');
                      console.error('Database error:', err);
                      return res.status(500).json({ error: 'Database error' });
                    }
                    
                    completed++;
                    
                    if (completed === ingredienten.length && !hasErrors) {
                      completeTransaction(newReceptId);
                    }
                  }
                );
              });
            });
            
            function completeTransaction(newReceptId) {
              db.run('COMMIT', (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  console.error('Error committing transaction:', err);
                  return res.status(500).json({ error: 'Database error' });
                }
                
                // Return the new recipe with its ingredients
                db.get('SELECT * FROM Recept WHERE ReceptID = ?', [newReceptId], (err, newRecept) => {
                  if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error' });
                  }
                  
                  db.all(
                    `SELECT ri.*, i.Naam as BasisNaam, i.Eenheid_Standaard, i.Categorie
                     FROM Recept_Ingredienten ri
                     LEFT JOIN Ingredienten i ON ri.IngredientBasisID = i.IngredientBasisID
                     WHERE ri.ReceptID = ?`,
                    [newReceptId],
                    (err, newIngredienten) => {
                      if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ error: 'Database error' });
                      }
                      
                      newRecept.StructuredIngredienten = newIngredienten || [];
                      res.status(201).json(newRecept);
                    }
                  );
                });
              });
            }
          }
        );
      });
    });
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
    const db = database.instance;
    
    // Check for related records in Maaltijden table
    db.get(
      'SELECT COUNT(*) as count FROM Maaltijden WHERE ReceptID = ?',
      [id],
      (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (result.count > 0) {
          return res.status(400).json({ 
            error: 'Dit recept is in gebruik bij maaltijden en kan niet worden verwijderd' 
          });
        }
        
        // Begin transaction for delete operation
        db.run('BEGIN TRANSACTION', (err) => {
          if (err) {
            console.error('Failed to begin transaction:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          
          // First delete all ingredient associations
          db.run(
            'DELETE FROM Recept_Ingredienten WHERE ReceptID = ?',
            [id],
            (err) => {
              if (err) {
                db.run('ROLLBACK');
                console.error('Database error deleting ingredients:', err);
                return res.status(500).json({ error: 'Database error' });
              }
              
              // Then delete the recipe itself
              db.run(
                'DELETE FROM Recept WHERE ReceptID = ?',
                [id],
                function(err) {
                  if (err) {
                    db.run('ROLLBACK');
                    console.error('Database error deleting recipe:', err);
                    return res.status(500).json({ error: 'Database error' });
                  }
                  
                  if (this.changes === 0) {
                    db.run('ROLLBACK');
                    return res.status(404).json({ error: 'Recept niet gevonden' });
                  }
                  
                  // Commit the transaction
                  db.run('COMMIT', (err) => {
                    if (err) {
                      db.run('ROLLBACK');
                      console.error('Error committing transaction:', err);
                      return res.status(500).json({ error: 'Database error' });
                    }
                    
                    res.json({ success: true, message: 'Recept verwijderd' });
                  });
                }
              );
            }
          );
        });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint to get all base ingredients
router.get('/ingredients/base', async (req, res) => {
  try {
    const db = database.instance;
    db.all(
      'SELECT * FROM Ingredienten ORDER BY Naam',
      [],
      (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
