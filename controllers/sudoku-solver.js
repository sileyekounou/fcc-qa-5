class SudokuSolver {

  validate(puzzleString) {
    if (!puzzleString || puzzleString.length !== 81) {
      return { valid: false, error: 'Expected puzzle to be 81 characters long' };
    }
    
    const validChars = /^[1-9.]*$/;
    if (!validChars.test(puzzleString)) {
      return { valid: false, error: 'Invalid characters in puzzle' };
    }
    
    for (let i = 0; i < 81; i++) {
      const char = puzzleString[i];
      if (char !== '.') {
        const row = Math.floor(i / 9);
        const col = i % 9;
        const value = parseInt(char);
        
        const tempPuzzle = puzzleString.substring(0, i) + '.' + puzzleString.substring(i + 1);
        
        if (!this.checkRowPlacement(tempPuzzle, row, col, value) ||
            !this.checkColPlacement(tempPuzzle, row, col, value) ||
            !this.checkRegionPlacement(tempPuzzle, row, col, value)) {
          return { valid: false, error: 'Puzzle cannot be solved' };
        }
      }
    }
    
    return { valid: true };
  }

  checkRowPlacement(puzzleString, row, column, value) {
    const startIndex = row * 9;
    const endIndex = startIndex + 9;
    const rowString = puzzleString.slice(startIndex, endIndex);
    
    for (let i = 0; i < rowString.length; i++) {
      if (i !== column && rowString[i] === value.toString()) {
        return false;
      }
    }
    return true;
  }

  checkColPlacement(puzzleString, row, column, value) {
    for (let r = 0; r < 9; r++) {
      if (r !== row) {
        const index = r * 9 + column;
        if (puzzleString[index] === value.toString()) {
          return false;
        }
      }
    }
    return true;
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const regionRowStart = Math.floor(row / 3) * 3;
    const regionColStart = Math.floor(column / 3) * 3;
    
    for (let r = regionRowStart; r < regionRowStart + 3; r++) {
      for (let c = regionColStart; c < regionColStart + 3; c++) {
        if (r !== row || c !== column) {
          const index = r * 9 + c;
          if (puzzleString[index] === value.toString()) {
            return false;
          }
        }
      }
    }
    return true;
  }
  
  isValidPlacement(puzzleString, row, col, value) {
    return this.checkRowPlacement(puzzleString, row, col, value) &&
           this.checkColPlacement(puzzleString, row, col, value) &&
           this.checkRegionPlacement(puzzleString, row, col, value);
  }
  
  findEmptyCell(puzzleString) {
    for (let i = 0; i < 81; i++) {
      if (puzzleString[i] === '.') {
        return {
          row: Math.floor(i / 9),
          col: i % 9,
          index: i
        };
      }
    }
    return null;
  }

  solve(puzzleString) {
    const validation = this.validate(puzzleString);
    if (!validation.valid) {
      return { error: validation.error };
    }
    
    const solution = this.solvePuzzle(puzzleString);
    
    if (solution) {
      return { solution: solution };
    } else {
      return { error: 'Puzzle cannot be solved' };
    }
  }
  
  solvePuzzle(puzzleString) {
    const emptyCell = this.findEmptyCell(puzzleString);
    
    if (!emptyCell) {
      return puzzleString;
    }
    
    const { row, col, index } = emptyCell;
    
    for (let value = 1; value <= 9; value++) {
      if (this.isValidPlacement(puzzleString, row, col, value)) {
        const newPuzzleString = puzzleString.substring(0, index) + 
                               value.toString() + 
                               puzzleString.substring(index + 1);
        
        const result = this.solvePuzzle(newPuzzleString);
        if (result) {
          return result;
        }
      }
    }
    
    return null;
  }
  
  convertCoordinate(coordinate) {
    if (!coordinate || coordinate.length !== 2) {
      return null;
    }
    
    const row = coordinate.charCodeAt(0) - 65;
    const col = parseInt(coordinate[1]) - 1;  
    
    if (row < 0 || row > 8 || col < 0 || col > 8) {
      return null;
    }
    
    return { row, col };
  }
  
  checkValue(puzzleString, coordinate, value) {
    const coords = this.convertCoordinate(coordinate);
    if (!coords) {
      return { valid: false, conflict: 'Invalid coordinate' };
    }
    
    const { row, col } = coords;
    
    if (value < 1 || value > 9) {
      return { valid: false, conflict: 'Invalid value' };
    }
    
    const conflicts = [];
    
    if (!this.checkRowPlacement(puzzleString, row, col, value)) {
      conflicts.push('row');
    }
    
    if (!this.checkColPlacement(puzzleString, row, col, value)) {
      conflicts.push('column');
    }
    
    if (!this.checkRegionPlacement(puzzleString, row, col, value)) {
      conflicts.push('region');
    }
    
    if (conflicts.length > 0) {
      return { 
        valid: false, 
        conflict: conflicts.join(' and ') 
      };
    }
    
    return { valid: true };
  }
}

module.exports = SudokuSolver;