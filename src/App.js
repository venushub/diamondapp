import React, { useState, useEffect } from "react";
import "./styles.css";

export default function App() {

  // the square contains any of the following states
  //  -> null -> when square in its initial state
  //  -> diamond -> when there is a diamond
  //  -> nodiamond -> when the square is visited and user clicks on next square
  //  -> degreerotation Eg: 45 -> when square is clicked but diamond is not present

  const [squares, setSquares] = useState(Array(64).fill(null));
  const [diamonds, setDiamonds] = useState([2, 23, 44, 16, 22, 55, 10, 36]);
  const [diamondsFound, setDiamondsFound] = useState(0);

  const handleSquareClick = (square, index) => {
    let sqrs = squares.concat([]);

    // clear rectangles to remove the previous arrow
    sqrs = sqrs.map(sqr => {
      if (sqr !== "diamond" && sqr !== "nodiamond" && sqr !== null) {
        return "nodiamond";
      } else {
        return sqr;
      }
    });

    // if index is a diamond index put diamond else getarrow direction
    if (diamonds.includes(index)) {
      sqrs[index] = "diamond";
    } else {
      sqrs[index] = getArrowDirection(index);
    }

    setSquares(sqrs);
  };

  // boot the game state from localstorage
  useEffect(() => {
    const squares_from_localstorage = localStorage.getItem("squares");
    console.log(squares_from_localstorage);
    if (squares_from_localstorage)
      setSquares(JSON.parse(squares_from_localstorage));
  }, []);

  //update found diamonds in state
  useEffect(() => {
    let total_diamonds_found = 0;
    squares.forEach(sqr => {
      if (sqr === "diamond") total_diamonds_found++;
    });
    setDiamondsFound(total_diamonds_found);
    localStorage.setItem("squares", JSON.stringify(squares));
  }, [squares]);

  // distance between two cartesian points
  const getDistanceBetweenTwoCartesianPoints = (p1, p2) => {
    const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    return dist;
  };

  // return arrow direction relative to y -axis
  const getArrowDirection = index => {
    // sort the diamonds array
    let sortedDiamonds = diamonds.sort();

    // cartesian points for all squares
    let cartesian_points = {};
    squares.forEach((square, index_square) => {
      cartesian_points[index_square] = {
        index: index_square,
        x: Math.ceil((index_square + 1) / 8),
        y: (index_square % 8) + 1
      };
    });

    // cartesian points for all diamonds
    let cartesian_diamonds = sortedDiamonds.map(dim => {
      return cartesian_points[dim];
    });

    // find all the distances between one point to other
    let distances = [];
    cartesian_diamonds.forEach(cds => {
      // only if square is not yet modified
      if (!squares[cds.index]) {
        const dist = getDistanceBetweenTwoCartesianPoints(
          cartesian_points[index],
          cds
        );
        distances.push({
          dist: dist,
          point: cds
        });
      }
    });

    // sort the distances
    let sorted_distances = distances.sort((a, b) => a.dist - b.dist);
    // least distance element is the first in sorted list
    const least_distance_point = sorted_distances[0];

    //find angle between two points with reference to y axis
    const p1 = cartesian_points[index];
    const p2 = least_distance_point.point;
    const angle = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;

    return angle;
  };

  // returns score after all diamonds are found
  const getScore = () => {
    let score = 0;
    squares.forEach(sqr => {
      if (sqr === null) score++;
    });
    return score;
  };

  // reset all squares
  const handlePlayAgain = () => {
    setSquares(Array(64).fill(null));
  };

  return (
    <div className="App">
      {diamondsFound === 0 ? (
        <div className="df ac jc">
          <h2>No Diamonds Found ! Keep Searching !!</h2>
          <button onClick={handlePlayAgain} className="my-button">
            Reset
          </button>
        </div>
      ) : diamondsFound === 8 ? (
        <div className="df ac jc">
          <h2>Found All Diamonds Your score is {getScore()}</h2>
          <button onClick={handlePlayAgain} className="my-button">
            play again
          </button>
        </div>
      ) : (
        <div className="df ac jc">
          <h2>
            Found {diamondsFound} diamonds {8 - diamondsFound} to go !
          </h2>
          <button onClick={handlePlayAgain} className="my-button">
            Reset
          </button>
        </div>
      )}

      {/* render squares */}
      <div className="squares-con">
        {squares.map((square, index) => {
          return (
            <Square
              key={index}
              index={index}
              square={square}
              onSquareClick={() => {
                if (diamondsFound < 8) handleSquareClick(square, index);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// square component
const Square = ({ square, onSquareClick, index }) => {
  return (
    <button className="square" onClick={onSquareClick}>
      {square !== null ? (
        square === "diamond" ? (
          <i className="large material-icons diamond">lens</i>
        ) : square === "nodiamond" ? (
          <div />
        ) : (
          <i
            style={{ transform: `rotate(${90 - square}deg)` }}
            className="large material-icons"
          >
            arrow_forward
          </i>
        )
      ) : (
        <i className="large material-icons">panorama_fish_eye</i>
      )}
    </button>
  );
};
