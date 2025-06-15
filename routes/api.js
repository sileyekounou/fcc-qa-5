'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      const { puzzle, coordinate, value } = req.body;
      
      if (!puzzle || !coordinate || !value) {
        return res.json({ error: 'Required field(s) missing' });
      }
      
      const validation = solver.validate(puzzle);
      if (!validation.valid) {
        return res.json({ error: validation.error });
      }
      
      const coords = solver.convertCoordinate(coordinate);
      if (!coords) {
        return res.json({ error: 'Invalid coordinate' });
      }
      
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 1 || numValue > 9) {
        return res.json({ error: 'Invalid value' });
      }

      const { row, col } = coords;
      const index = row * 9 + col;
      
      if (puzzle[index] === value.toString()) {
        return res.json({ valid: true });
      }
      
      if (puzzle[index] !== '.' && puzzle[index] !== value.toString()) {
        return res.json({ valid: true });
      }
      
      const conflicts = [];

      if (!solver.checkRowPlacement(puzzle, row, col, numValue)) {
        conflicts.push('row');
      }

      if (!solver.checkColPlacement(puzzle, row, col, numValue)) {
        conflicts.push('column');
      }

      if (!solver.checkRegionPlacement(puzzle, row, col, numValue)) {
        conflicts.push('region');
      }
      
      if (conflicts.length === 0) {
        return res.json({ valid: true });
      } else {
        return res.json({ 
          valid: false, 
          conflict: conflicts 
        });
      }
    });
    
  app.route('/api/solve')
    .post((req, res) => {
      const { puzzle } = req.body;
      
      if (!puzzle) {
        return res.json({ error: 'Required field missing' });
      }
      
      const validation = solver.validate(puzzle);
      if (!validation.valid) {
        return res.json({ error: validation.error });
      }
      
      const result = solver.solve(puzzle);

      if (result.error) {
        return res.json({ error: result.error });
      }
      
      return res.json({ solution: result.solution });
    });
};