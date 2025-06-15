const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
let solver;

suite('Unit Tests', () => {
  
  const validPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
  const solvedPuzzle = '135762984946381257728459613694517832812936745357824196473298561581673429269145378';
  const invalidPuzzle = '115..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
  
  suiteSetup(() => {
    solver = new Solver();
  });

  suite('Validation Tests', () => {
    
    test('Logic handles a valid puzzle string of 81 characters', () => {
      const result = solver.validate(validPuzzle);
      assert.isTrue(result.valid);
    });

    test('Logic handles a puzzle string with invalid characters (not 1-9 or .)', () => {
      const invalidCharPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.3a.';
      const result = solver.validate(invalidCharPuzzle);
      assert.isFalse(result.valid);
      assert.equal(result.error, 'Invalid characters in puzzle');
    });

    test('Logic handles a puzzle string that is not 81 characters in length', () => {
      const shortPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.3';
      const result = solver.validate(shortPuzzle);
      assert.isFalse(result.valid);
      assert.equal(result.error, 'Expected puzzle to be 81 characters long');
    });

    test('Logic handles an invalid puzzle string (impossible to solve)', () => {
      const result = solver.validateComplete(invalidPuzzle);
      assert.isFalse(result.valid);
      assert.equal(result.error, 'Puzzle cannot be solved');
    });

  });

  suite('Row Placement Tests', () => {

    test('Logic handles a valid row placement', () => {
      const result = solver.checkRowPlacement(validPuzzle, 0, 1, 3);
      assert.isTrue(result);
    });

    test('Logic handles an invalid row placement', () => {
      const result = solver.checkRowPlacement(validPuzzle, 0, 1, 1);
      assert.isFalse(result);
    });

    test('Logic handles a valid row placement when cell is already filled', () => {
      const result = solver.checkRowPlacement(validPuzzle, 0, 0, 9);
      assert.isTrue(result);
    });

  });

  suite('Column Placement Tests', () => {

    test('Logic handles a valid column placement', () => {
      const result = solver.checkColPlacement(validPuzzle, 1, 1, 3);
      assert.isTrue(result);
    });

    test('Logic handles an invalid column placement', () => {
      const result = solver.checkColPlacement(validPuzzle, 1, 0, 1);
      assert.isFalse(result);
    });

    test('Logic handles a valid column placement when cell is already filled', () => {
      const result = solver.checkColPlacement(validPuzzle, 0, 0, 9);
      assert.isTrue(result);
    });

  });

  suite('Region Placement Tests', () => {

    test('Logic handles a valid region (3x3 grid) placement', () => {
      const result = solver.checkRegionPlacement(validPuzzle, 0, 1, 3);
      assert.isTrue(result);
    });

    test('Logic handles an invalid region (3x3 grid) placement', () => {
      const result = solver.checkRegionPlacement(validPuzzle, 0, 1, 1);
      assert.isFalse(result);
    });

    test('Logic handles a valid region placement when cell is already filled', () => {
      const result = solver.checkRegionPlacement(validPuzzle, 0, 0, 9);
      assert.isTrue(result);
    });

  });

  suite('Solver Tests', () => {

    test('Valid puzzle strings pass the solver', () => {
      const result = solver.solve(validPuzzle);
      assert.property(result, 'solution');
      assert.isString(result.solution);
      assert.lengthOf(result.solution, 81);
    });

    test('Invalid puzzle strings fail the solver', () => {
      const result = solver.solve(invalidPuzzle);
      assert.property(result, 'error');
      assert.equal(result.error, 'Puzzle cannot be solved');
    });

    test('Solver returns the expected solution for an incomplete puzzle', () => {
      const result = solver.solve(validPuzzle);
      assert.property(result, 'solution');
      
      const validation = solver.validate(result.solution);
      assert.isTrue(validation.valid);
      
      assert.isTrue(/^[1-9]{81}$/.test(result.solution));
    });

    test('Solver handles a puzzle that is already solved', () => {
      const result = solver.solve(solvedPuzzle);
      assert.property(result, 'solution');
      assert.equal(result.solution, solvedPuzzle);
    });

    test('Solver handles an empty puzzle string', () => {
      const emptyPuzzle = '.'.repeat(81);
      const result = solver.solve(emptyPuzzle);
      assert.property(result, 'solution');
      assert.isString(result.solution);
      assert.lengthOf(result.solution, 81);
      assert.isTrue(/^[1-9]{81}$/.test(result.solution));
    });

    test('Solver handles a puzzle string that is too short', () => {
      const shortPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.3';
      const result = solver.solve(shortPuzzle);
      assert.property(result, 'error');
      assert.equal(result.error, 'Expected puzzle to be 81 characters long');
    });

    test('Solver handles a puzzle string that is too long', () => {
      const longPuzzle = validPuzzle + '1';
      const result = solver.solve(longPuzzle);
      assert.property(result, 'error');
      assert.equal(result.error, 'Expected puzzle to be 81 characters long');
    });

    test('Solver handles a puzzle string with invalid characters', () => {
      const invalidCharPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.3X.';
      const result = solver.solve(invalidCharPuzzle);
      assert.property(result, 'error');
      assert.equal(result.error, 'Invalid characters in puzzle');
    });

  });

  suite('Helper Method Tests', () => {

    test('convertCoordinate handles valid coordinates', () => {
      const result = solver.convertCoordinate('A1');
      assert.deepEqual(result, { row: 0, col: 0 });
      
      const result2 = solver.convertCoordinate('I9');
      assert.deepEqual(result2, { row: 8, col: 8 });
      
      const result3 = solver.convertCoordinate('E5');
      assert.deepEqual(result3, { row: 4, col: 4 });
    });

    test('convertCoordinate handles invalid coordinates', () => {
      assert.isNull(solver.convertCoordinate('J1'));
      assert.isNull(solver.convertCoordinate('A0'));
      assert.isNull(solver.convertCoordinate('A10'));
      assert.isNull(solver.convertCoordinate('Z5'));
      assert.isNull(solver.convertCoordinate('A'));
      assert.isNull(solver.convertCoordinate('1'));
      assert.isNull(solver.convertCoordinate(''));
    });

    test('checkValue handles valid placements', () => {
      const result = solver.checkValue(validPuzzle, 'A2', 3);
      assert.isTrue(result.valid);
    });

    test('checkValue handles invalid placements with conflicts', () => {
      const result = solver.checkValue(validPuzzle, 'A2', 1);
      assert.isFalse(result.valid);
      assert.include(result.conflict, 'row');
    });

    test('findEmptyCell finds the first empty cell', () => {
      const result = solver.findEmptyCell(validPuzzle);
      assert.isObject(result);
      assert.equal(result.row, 0);
      assert.equal(result.col, 1);
      assert.equal(result.index, 1);
    });

    test('findEmptyCell returns null for solved puzzle', () => {
      const result = solver.findEmptyCell(solvedPuzzle);
      assert.isNull(result);
    });

  });

});