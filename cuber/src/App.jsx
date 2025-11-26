import { useState } from "react";
import "./App.css";
import React from "react";
import Start from "./components/start_page"
import FaceSet from "./components/face_set"
import Position from "./components/positioning";
import Solver from "./components/solver/";
import { useEffect } from "react";

function App() {
	// Define default color array for each cube face in a solved state
	let frontColor = ['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'];
	let rightColor = ['red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'red'];
	let upperColor = ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'];
	let downColor = ['yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow'];
	let leftColor = ['orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange'];
	let backColor = ['blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue'];
	// "inputFaceColors" object wraps-up above "color array" inside it
	let [inputFaceColors, setInputFaceColor] = useState({});
	// "algoResult" stores forward and backward algorithm outputs
	let [algoResult, setAlgoResult] = useState({});
	
	function resetCube()
	{
		setInputFaceColor(
			{
				front: frontColor,
				right: rightColor,
				upper: upperColor,
				down: downColor,
				left: leftColor,
				back: backColor
			}
		);
		setAlgoResult(
			{
				forwardAlgo: [],
				reverseAlgo: []
			}
		);
	}
	// Set Cube Parameters only once at first
	useEffect(() =>
	{
		resetCube();
	}, []);

	let [pageVisibility, setPageVisibility] = useState([true, false, false, false, false]);

	function handleStart()
	{
		setPageVisibility([false, true, false, false, false]);
	}
	function handlePosition()
	{
		setPageVisibility([false, false, true, false, false]);
	}
	function handleFaceInput()
	{
		setPageVisibility([false, false, false, true, false]);
	}
    
    // Logic to update a specific sticker
    function updateFaceColor(faceName, index, color) {
        setInputFaceColor(prev => {
            let newFaceArray = [...prev[faceName]];
            // Don't allow changing the center piece (index 4)
            if (index !== 4) {
                newFaceArray[index] = color;
            }
            return {
                ...prev,
                [faceName]: newFaceArray
            };
        });
    }

	// Logic to Scramble the cube (Rotate logical arrays)
	function scrambleCube() {
		let moves = ["U", "D", "L", "R", "F", "B"];
		let scrambleLength = 20;
		let currentColors = { ...inputFaceColors };

		// Helpers to rotate specific arrays
		const rotateFaceClockwise = (arr) => {
			return [
				arr[6], arr[3], arr[0],
				arr[7], arr[4], arr[1],
				arr[8], arr[5], arr[2]
			];
		};

		const applyMove = (move, state) => {
			let { front, right, upper, down, left, back } = state;
			let newFront = [...front], newRight = [...right], newUpper = [...upper], 
				newDown = [...down], newLeft = [...left], newBack = [...back];

			switch (move) {
				case "U": // Upper Clockwise
					newUpper =TkateFaceClockwise(upper);
					// F -> L -> B -> R -> F (Top row 0,1,2)
					[0, 1, 2].forEach(i => {
						newLeft[i] = front[i];
						newBack[i] = left[i];
						newRight[i] = back[i];
						newFront[i] = right[i];
					});
					break;
				case "D": // Down Clockwise
					newDown = rotateFaceClockwise(down);
					// F -> R -> B -> L -> F (Bottom row 6,7,8)
					[6, 7, 8].forEach(i => {
						newRight[i] = front[i];
						newBack[i] = right[i];
						newLeft[i] = back[i];
						newFront[i] = left[i];
					});
					break;
				case "L": // Left Clockwise
					newLeft = rotateFaceClockwise(left);
					// U -> F -> D -> B(inv) -> U (Col 0,3,6)
					[0, 3, 6].forEach(i => {
						newFront[i] = upper[i];
						newDown[i] = front[i];
					});
					newBack[8] = down[0]; newBack[5] = down[3]; newBack[2] = down[6];
					newUpper[0] = back[8]; newUpper[3] = back[5]; newUpper[6] = back[2];
					break;
				case "R": // Right Clockwise
					newRight = rotateFaceClockwise(right);
					// U -> B(inv) -> D -> F -> U (Col 2,5,8)
					[2, 5, 8].forEach(i => {
						newBack[10-i-2] = upper[i]; // 8->0, 5->3, 2->6 logic handled manually below
					});
					newBack[6] = upper[2]; newBack[3] = upper[5]; newBack[0] = upper[8];
					newDown[2] = back[6]; newDown[5] = back[3]; newDown[8] = back[0];
					newFront[2] = down[2]; newFront[5] = down[5]; newFront[8] = down[8];
					newUpper[2] = front[2]; newUpper[5] = front[5]; newUpper[8] = front[8];
					break;
				case "F": // Front Clockwise
					newFront = rotateFaceClockwise(front);
					// U(6,7,8) -> R(0,3,6) -> D(2,1,0) -> L(8,5,2) -> U
					newRight[0] = upper[6]; newRight[3] = upper[7]; newRight[6] = upper[8];
					newDown[2] = right[0]; newDown[1] = right[3]; newDown[0] = right[6];
					newLeft[8] = down[2]; newLeft[5] = down[1]; newLeft[2] = down[0];
					newUpper[6] = left[8]; newUpper[7] = left[5]; newUpper[8] = left[2];
					break;
				case "B": // Back Clockwise
					newBack = rotateFaceClockwise(back);
					// U(2,1,0) -> L(0,3,6) -> D(6,7,8) -> R(8,5,2) -> U
					newLeft[0] = upper[2]; newLeft[3] = upper[1]; newLeft[6] = upper[0];
					newDown[6] = left[0]; newDown[7] = left[3]; newDown[8] = left[6];
					newRight[8] = down[6]; newRight[5] = down[7]; newRight[2] = down[8];
					newUpper[2] = right[8]; newUpper[1] = right[5]; newUpper[0] = right[2];
					break;
			}
			
			// Helper function inside scope
			function TkateFaceClockwise(arr) {
				return [arr[6], arr[3], arr[0], arr[7], arr[4], arr[1], arr[8], arr[5], arr[2]];
			}

			return { front: newFront, right: newRight, upper: newUpper, down: newDown, left: newLeft, back: newBack };
		};

		// Apply random moves
		for(let i=0; i<scrambleLength; i++) {
			let randomMove = moves[Math.floor(Math.random() * moves.length)];
			currentColors = applyMove(randomMove, currentColors);
		}
		setInputFaceColor(currentColors);
	}

	function handleFaceSet(e) {
        // ... (Keep existing logic if needed for text inputs, but 3D is primary now)
        // Leaving this as fallback or you can remove it if fully switching
    }

	function handleSolver()
	{
		console.log("Solver Ran");
	}
	function replayApp()
	{
		resetCube();
		setPageVisibility([true, false, false, false, false]);
	}
	function handleAlgoResult(algo)
	{
		let forward = algo.solveMoves;
		let reverse = algo.reverseMoves;
		setAlgoResult({forwardAlgo: forward, reverseAlgo: reverse});
	}

	return (
		<div className="App">
			<div className="app__container">
				{pageVisibility[0] && <Start handleClick={handleStart}/>}
				{pageVisibility[1] && <Position handleClick={handlePosition} />}
				{pageVisibility[2] && <FaceSet 
                    handleClick={handleFaceInput} 
                    handleChange={handleFaceSet} 
                    colors={inputFaceColors} 
                    setAlgo={(algo) => handleAlgoResult(algo)} 
                    cubeColorState={inputFaceColors}
                    updateFaceColor={updateFaceColor} // Pass new function
                    onScramble={scrambleCube}         // Pass scramble function
                />}
				{pageVisibility[3] && <Solver handleClick={handleSolver} movesAlgo={algoResult } handleReplay={replayApp}/> }
			</div>
		</div>
	);
}

export default App;