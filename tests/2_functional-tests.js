const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {
  
  const validPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
  const solvedPuzzle = '135762984946381257728459613694517832812936745357824196473298561581673429269145378';
  const invalidPuzzle = '115..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
  const unsolvablePuzzle = '5..91372.3...8.5.9.9.25..8.68.47.23...95..46.7.4.....5.2.......4..8916..85.72...3';

  suite('POST /api/check', () => {

    test('Check a puzzle placement with all fields: POST request to /api/check', (done) => {
      chai
        .request(server)
        .post('/api/check')
        .send({
          puzzle: validPuzzle,
          coordinate: 'A2',
          value: '3'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'valid');
          assert.isTrue(res.body.valid);
          done();
        });
    });

    test('Check a puzzle placement with single placement conflict: POST request to /api/check', (done) => {
      chai
        .request(server)
        .post('/api/check')
        .send({
          puzzle: validPuzzle,
          coordinate: 'A2',
          value: '1'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'valid');
          assert.isFalse(res.body.valid);
          assert.property(res.body, 'conflict');
          assert.isArray(res.body.conflict);
          assert.include(res.body.conflict, 'row');
          done();
        });
    });

    test('Check a puzzle placement with multiple placement conflicts: POST request to /api/check', (done) => {
      chai
        .request(server)
        .post('/api/check')
        .send({
          puzzle: validPuzzle,
          coordinate: 'A2',
          value: '2'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'valid');
          assert.isFalse(res.body.valid);
          assert.property(res.body, 'conflict');
          assert.isArray(res.body.conflict);
          assert.include(res.body.conflict, 'row');
          assert.include(res.body.conflict, 'region');
          done();
        });
    });

    test('Check a puzzle placement with all placement conflicts: POST request to /api/check', (done) => {
      let puzzle = '.'.repeat(81);
      puzzle = puzzle.substring(0, 8) + '1' + puzzle.substring(9);
      puzzle = puzzle.substring(0, 73) + '1' + puzzle.substring(74);
      puzzle = puzzle.substring(0, 20) + '1' + puzzle.substring(21);
      
      chai
        .request(server)
        .post('/api/check')
        .send({
          puzzle: puzzle,
          coordinate: 'A2',
          value: '1'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'valid');
          assert.isFalse(res.body.valid);
          assert.property(res.body, 'conflict');
          assert.isArray(res.body.conflict);
          assert.include(res.body.conflict, 'row');
          assert.include(res.body.conflict, 'column');
          assert.include(res.body.conflict, 'region');
          done();
        });
    });

    test('Check a puzzle placement with missing required fields: POST request to /api/check', (done) => {
      chai
        .request(server)
        .post('/api/check')
        .send({
          puzzle: validPuzzle,
          coordinate: 'A2'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Required field(s) missing');
          done();
        });
    });

    test('Check a puzzle placement with invalid characters: POST request to /api/check', (done) => {
      chai
        .request(server)
        .post('/api/check')
        .send({
          puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.3X.',
          coordinate: 'A2',
          value: '3'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Invalid characters in puzzle');
          done();
        });
    });

    test('Check a puzzle placement with incorrect length: POST request to /api/check', (done) => {
      chai
        .request(server)
        .post('/api/check')
        .send({
          puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.3',
          coordinate: 'A2',
          value: '3'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
          done();
        });
    });

    test('Check a puzzle placement with invalid placement coordinate: POST request to /api/check', (done) => {
      chai
        .request(server)
        .post('/api/check')
        .send({
          puzzle: validPuzzle,
          coordinate: 'Z1',
          value: '3'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Invalid coordinate');
          done();
        });
    });

    test('Check a puzzle placement with invalid placement value: POST request to /api/check', (done) => {
      chai
        .request(server)
        .post('/api/check')
        .send({
          puzzle: validPuzzle,
          coordinate: 'A2',
          value: '0'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Invalid value');
          done();
        });
    });

    test('Check a puzzle placement when value is already placed: POST request to /api/check', (done) => {
      chai
        .request(server)
        .post('/api/check')
        .send({
          puzzle: validPuzzle,
          coordinate: 'A1',
          value: '1'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'valid');
          assert.isTrue(res.body.valid);
          done();
        });
    });

  });

  suite('POST /api/solve', () => {

    test('Solve a puzzle with valid puzzle string: POST request to /api/solve', (done) => {
      chai
        .request(server)
        .post('/api/solve')
        .send({
          puzzle: validPuzzle
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'solution');
          assert.isString(res.body.solution);
          assert.lengthOf(res.body.solution, 81);
          assert.isTrue(/^[1-9]{81}$/.test(res.body.solution));
          done();
        });
    });

    test('Solve a puzzle with missing puzzle string: POST request to /api/solve', (done) => {
      chai
        .request(server)
        .post('/api/solve')
        .send({
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Required field missing');
          done();
        });
    });

    test('Solve a puzzle with invalid characters: POST request to /api/solve', (done) => {
      chai
        .request(server)
        .post('/api/solve')
        .send({
          puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.3X.'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Invalid characters in puzzle');
          done();
        });
    });

    test('Solve a puzzle with incorrect length: POST request to /api/solve', (done) => {
      chai
        .request(server)
        .post('/api/solve')
        .send({
          puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.3'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
          done();
        });
    });

    test('Solve a puzzle that cannot be solved: POST request to /api/solve', (done) => {
      chai
        .request(server)
        .post('/api/solve')
        .send({
          puzzle: invalidPuzzle
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Puzzle cannot be solved');
          done();
        });
    });

    test('Solve a puzzle that is already solved: POST request to /api/solve', (done) => {
      chai
        .request(server)
        .post('/api/solve')
        .send({
          puzzle: solvedPuzzle
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'solution');
          assert.equal(res.body.solution, solvedPuzzle);
          done();
        });
    });

    test('Solve an empty puzzle: POST request to /api/solve', (done) => {
      const emptyPuzzle = '.'.repeat(81);
      chai
        .request(server)
        .post('/api/solve')
        .send({
          puzzle: emptyPuzzle
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'solution');
          assert.isString(res.body.solution);
          assert.lengthOf(res.body.solution, 81);
          assert.isTrue(/^[1-9]{81}$/.test(res.body.solution));
          done();
        });
    });

    test('Solve a puzzle with only a few clues: POST request to /api/solve', (done) => {
      const sparsePuzzle = '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
      chai
        .request(server)
        .post('/api/solve')
        .send({
          puzzle: sparsePuzzle
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'solution');
          assert.isString(res.body.solution);
          assert.lengthOf(res.body.solution, 81);
          assert.isTrue(/^[1-9]{81}$/.test(res.body.solution));
          done();
        });
    });

  });

  suite('Additional Edge Cases', () => {

    test('Check placement with coordinate at boundary (I9): POST request to /api/check', (done) => {
      chai
        .request(server)
        .post('/api/check')
        .send({
          puzzle: validPuzzle,
          coordinate: 'I9',
          value: '8'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'valid');
          done();
        });
    });

    test('Check placement with lowercase coordinate: POST request to /api/check', (done) => {
      chai
        .request(server)
        .post('/api/check')
        .send({
          puzzle: validPuzzle,
          coordinate: 'a2',
          value: '3'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Invalid coordinate');
          done();
        });
    });

    test('Check placement with numeric string value: POST request to /api/check', (done) => {
      chai
        .request(server)
        .post('/api/check')
        .send({
          puzzle: validPuzzle,
          coordinate: 'A2',
          value: 3 
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'valid');
          done();
        });
    });

    test('Solve with null puzzle: POST request to /api/solve', (done) => {
      chai
        .request(server)
        .post('/api/solve')
        .send({
          puzzle: null
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Required field missing');
          done();
        });
    });

  });

});