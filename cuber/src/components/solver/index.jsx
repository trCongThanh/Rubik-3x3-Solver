import "./style.css";
import React, { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti"

function Solver(props) {
	let delay = 500, i = 0;
	let reverseIndex = 0, forwardIndex = 0;
	let [cubeSolved, setCubeSolved] = useState(false);
	let [stepCount, setStepCount] = useState(0);
	let [moveMessage, setMoveMessage] = useState("Syncing...");
    
    // Auto run state
    let [isAutoRunning, setIsAutoRunning] = useState(false);
    let autoRunInterval = useRef(null);
    const nextMoveRef = useRef(null);

    // Camera Rotation State
    let [cameraRotation, setCameraRotation] = useState({ x: -35, y: -135 });

	let orientation = { front: 1, right: 4, upper: 2, down: 3, left: 5, back: 0 };

    // --- Mouse Control for Camera ---
    useEffect(() => {
        let isDragging = false;
        let startX, startY;
        const sensitivity = 0.5;

        const handleMouseDown = (e) => {
            if(e.target.tagName === 'BUTTON') return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
        };

        const handleMouseMove = (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            setCameraRotation(prev => ({
                x: prev.x - deltaY * sensitivity,
                y: prev.y + deltaX * sensitivity
            }));

            startX = e.clientX;
            startY = e.clientY;
        };

        const handleMouseUp = () => {
            isDragging = false;
        };

        const container = document.querySelector('.cube__container');
        if(container) {
            container.addEventListener('mousedown', handleMouseDown);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            if(container) container.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
    }, []);

	useEffect(() => {
        let cubePivot = document.querySelector("#pivot");
		let movesNum = document.querySelector(".moves__num");
		let stepCountBtn = document.querySelector(".step__count");
        let nextBtn = document.querySelector(".next__move--btn");
        let prevBtn = document.querySelector(".previous__btn");
        let repeatBtn = document.querySelector(".repeat__btn");
        let replayBtn = document.querySelector(".replay__btn");
        let retryBtn = document.querySelector(".retry__btn--scramble");
		let scrambleError = document.querySelector(".scramble__error");

        var colors = ["blue", "green", "white", "yellow", "red", "orange"],
			pieces = document.getElementsByClassName("piece");

        function mx(i, j) { return ([2, 4, 3, 5][j % 4 | 0] + (i % 2) * (((j | 0) % 4) * 2 + 3) + 2 * ((i / 2) | 0)) % 6; }
		function getAxis(face) { return String.fromCharCode("X".charCodeAt(0) + face / 2); }
        function getPieceBy(face, index, corner) { return document.getElementById("piece" + ((1 << face) + (1 << mx(face, index)) + (1 << mx(face, index + 1)) * corner)); }
        
        function assembleCube() { 
            function moveto(face) {
				id = id + (1 << face);
				pieces[i].children[face].appendChild(document.createElement("div")).setAttribute("class", "sticker " + colors[face]);
				return "translate" + getAxis(face) + "(" + ((face % 2) * 4 - 2) + "em)";
			}
			for (var id, x, i = 0; (id = 0), i < 26; i++) {
				x = mx(i, i % 18);
				pieces[i].style.transform = "rotateX(0deg)" + moveto(i % 6) + (i > 5 ? moveto(x) + (i > 17 ? moveto(mx(x, x + 2)) : ""): "");
				pieces[i].setAttribute("id", "piece" + id);
			}
        }
        function swapPieces(face, times) { 
            for (var i = 0; i < 6 * times; i++) {
				var piece1 = getPieceBy(face, i / 2, i % 2), piece2 = getPieceBy(face, i / 2 + 1, i % 2);
				for (var j = 0; j < 5; j++) {
					var sticker1 = piece1.children[j < 4 ? mx(face, j) : face].firstChild, sticker2 = piece2.children[j < 4 ? mx(face, j + 1) : face].firstChild, className = sticker1 ? sticker1.className : "";
					if (className) (sticker1.className = sticker2.className), (sticker2.className = className);
				}
			}
        }
        function animateRotation(face, cw, currentTime, async = true) {
			var k = 0.3 * ((face % 2) * 2 - 1) * (2 * cw - 1),
				qubes = Array(9)
					.fill(pieces[face])
					.map(function (value, index) {
						return index
							? getPieceBy(face, index / 2, index % 2)
							: value;
					});
			if(async)
			{
				(function rotatePieces() {
					var passed = Date.now() - currentTime,
						style = "rotate" + getAxis(face) + "(" + k * passed * (passed < 300) + "deg)";
					qubes.forEach(function (piece) {
						piece.style.transform = piece.style.transform.replace(
							/rotate.\(\S+\)/,
							style
						);
					});
					if (passed >= 300) return swapPieces(face, 3 - 2 * cw);
					requestAnimationFrame(rotatePieces);
				})();
			}
			else
			{
				swapPieces(face, 3 - 2 * cw);
			}
		}

        function rotateFront(clockwise, async) { animateRotation(orientation.front, clockwise, Date.now(), async); }
		function rotateRight(clockwise, async) { animateRotation(orientation.right, clockwise, Date.now(), async); }
		function rotateUpper(clockwise, async) { animateRotation(orientation.upper, clockwise, Date.now(), async); }
		function rotateDown(clockwise, async) { animateRotation(orientation.down, clockwise, Date.now(), async); }
		function rotateLeft(clockwise, async) { animateRotation(orientation.left, clockwise, Date.now(), async); }
		function rotateBack(clockwise, async) { animateRotation(orientation.back, clockwise, Date.now(), async); }

        var startXYZ = [0, 0, 0];
		let startX = 0;
		function turnX(clockwise, async = true) {
			if (clockwise) startX = startX + 90;
			else startX = startX - 90;
			if(async) pivot.style.transition = "all 0.5s ease-in-out";
			else pivot.style.transition = "all 0s ease-in-out";
			pivot.style.transform = `rotateX(${startXYZ[0]}deg) rotateY(${startXYZ[1]}deg) rotateZ(${startXYZ[2]}deg) rotate3d(1,0,0,${startX}deg)`;
			let prevOrientation = orientation;
			if (clockwise) {
			orientation =  { ...prevOrientation, right: prevOrientation.upper, upper: prevOrientation.left, down: prevOrientation.right, left: prevOrientation.down, };
			} else {
			orientation = { ...prevOrientation, right: prevOrientation.down, upper: prevOrientation.right, down: prevOrientation.left, left: prevOrientation.upper, };
			}
		}
		function turnY(clockwise, async = true) {
			if (clockwise) startXYZ[1] = startXYZ[1] - 90;
			else startXYZ[1] = startXYZ[1] + 90;
			if(async) pivot.style.transition = "all 0.5s ease-in-out";
			else pivot.style.transition = "all 0s ease-in-out";
			pivot.style.transform = `rotateX(${startXYZ[0]}deg) rotateY(${startXYZ[1]}deg) rotateZ(${startXYZ[2]}deg)`;
			let prevOrientation = orientation;
			if (clockwise) {
			orientation =  { ...prevOrientation, front: prevOrientation.right, right: prevOrientation.back, left: prevOrientation.front, back: prevOrientation.left, };
			} else {
			orientation = { ...prevOrientation, front: prevOrientation.left, right: prevOrientation.front, left: prevOrientation.back, back: prevOrientation.right, };
			}
		}
		function turnZ(clockwise, async = true) {
			if (clockwise) startXYZ[2] = startXYZ[2] - 90;
			else startXYZ[2] = startXYZ[2] + 90;
			if(async) pivot.style.transition = "all 0.5s ease-in-out";
			else pivot.style.transition = "all 0s ease-in-out";
			pivot.style.transform = `rotateX(${startXYZ[0]}deg) rotateY(${startXYZ[1]}deg) rotateZ(${startXYZ[2]}deg)`;
			let prevOrientation = orientation;
			if (clockwise) {
			orientation =  { ...prevOrientation, front: prevOrientation.down, upper: prevOrientation.front, down: prevOrientation.back, back: prevOrientation.upper, };
			} else {
			orientation = { ...prevOrientation, front: prevOrientation.upper, upper: prevOrientation.back, down: prevOrientation.front, back: prevOrientation.down, };
			}
		}

        function rotateFrontDual(clockwise, async) { if (async) i++; rotateBack(clockwise, async); if (async) { setTimeout(() => { turnX(clockwise); i--; }, delay); } else { turnX(clockwise, async); } }
		function rotateRightDual(clockwise, async) { if (async) i++; rotateLeft(clockwise, async); if (async) { setTimeout(() => { turnZ(clockwise); i--; }, delay); } else { turnZ(clockwise, async); } }
		function rotateUpperDual(clockwise, async) { if (async) i++; rotateDown(clockwise, async); if (async) { setTimeout(() => { turnY(clockwise); i--; }, delay); } else { turnY(clockwise, async); } }
		function rotateDownDual(clockwise, async) { if (async) i++; rotateUpper(clockwise, async); if (async) { setTimeout(() => { turnY(!clockwise); i--; }, delay); } else { turnY(!clockwise, async); } }
		function rotateLeftDual(clockwise, async) { if (async) i++; rotateRight(clockwise, async); if (async) { setTimeout(() => { turnZ(!clockwise); i--; }, delay); } else { turnZ(!clockwise, async); } }
		function rotateBackDual(clockwise, async) { if (async) i++; rotateFront(clockwise, async); if (async) { setTimeout(() => { turnX(!clockwise); i--; }, delay); } else { turnX(!clockwise, async); } }
		function rotateM(clockwise, async) { if (async) i += 2; rotateRight(clockwise, async); if (async) { setTimeout(() => { rotateLeft(!clockwise, async); i--; setTimeout(() => { turnZ(!clockwise); i--; }, delay); }, delay); } else { rotateLeft(!clockwise, async); turnZ(!clockwise, async); } }
		function rotateE(clockwise, async) { if (async) i += 2; rotateUpper(clockwise, async); if (async) { setTimeout(() => { rotateDown(!clockwise, async); i--; setTimeout(() => { turnY(!clockwise); i--; }, delay); }, delay); } else { rotateDown(!clockwise, async); turnY(!clockwise, async); } }
		function rotateS(clockwise, async) { if (async) i += 2; rotateFront(!clockwise, async); if (async) { setTimeout(() => { rotateBack(clockwise, async); i--; setTimeout(() => { turnX(clockwise); i--; }, delay); }, delay); } else { rotateBack(clockwise, async); turnX(clockwise, async); } }

		function applyMove(move, async) {
			let rotation = move[0];
			let clockwise = move.includes("2") ? true : move.includes("prime") ? false : true;
			let moveFunction = function findMove() {
				switch (rotation) {
					case "F": return rotateFront(clockwise, async);
					case "R": return rotateRight(clockwise, async);
					case "U": return rotateUpper(clockwise, async);
					case "D": return rotateDown(clockwise, async);
					case "L": return rotateLeft(clockwise, async);
					case "B": return rotateBack(clockwise, async);
					case "f": return rotateFrontDual(clockwise, async);
					case "r": return rotateRightDual(clockwise, async);
					case "u": return rotateUpperDual(clockwise, async);
					case "d": return rotateDownDual(clockwise, async);
					case "l": return rotateLeftDual(clockwise, async);
					case "b": return rotateBackDual(clockwise, async);
					case "M": return rotateM(clockwise, async);
					case "E": return rotateE(clockwise, async);
					case "S": return rotateS(clockwise, async);
					default: console.log("Move Function Conversion Error");
				}
			};
			moveFunction(); 
			if (move.includes("2")) {
				if (async) { i++; setTimeout(() => { moveFunction(); i--; }, delay); } else { moveFunction(); }
			}
		}

        assembleCube();

		function scramble_cube() {
			movesNum.classList.remove("active");
			stepCountBtn.classList.remove("active");
			prevBtn.setAttribute("disabled", "");
			repeatBtn.setAttribute("disabled", "");
			nextBtn.setAttribute("disabled", "");
			let async = false; 
			setTimeout(() => {
				for(reverseIndex = 0; reverseIndex <= props.movesAlgo.reverseAlgo.length - 1; reverseIndex++) {
					applyMove(props.movesAlgo.reverseAlgo[reverseIndex], async);
				}
				movesNum.classList.add("active");
				nextBtn.removeAttribute("disabled");
				setMoveMessage(`Orient your cube as shown here to solve.`);
			}, 1000);
		}
		scramble_cube();

        function reScramble() {
			reverseIndex = 0;
			retryBtn.classList.remove("active");
			scrambleError.classList.remove("active");
			scramble_cube();
			assembleCube();
		}
		function nextMove(repeat = false) {
			i++; 
			movesNum.classList.remove("active");
			repeatBtn.removeAttribute("disabled"); 
			stepCountBtn.classList.add("active"); 
			let async = true;
			setTimeout(() => {
				if (forwardIndex < props.movesAlgo.forwardAlgo.length) {
					if (!repeat) setStepCount((prevCount) => prevCount + 1);
					
                    applyMove(props.movesAlgo.forwardAlgo[forwardIndex], async);
					
					if(forwardIndex == props.movesAlgo.forwardAlgo.length - 1) {
						nextBtn.setAttribute("disabled", "");
                        if(autoRunInterval.current) {
                            clearInterval(autoRunInterval.current);
                            setIsAutoRunning(false);
                        }
						setCubeSolved(true);
						replayBtn.classList.add("active");
						setTimeout(() => {
							cubePivot.classList.add("active");
							setMoveMessage(`CONGRATULATIONS!!! Cube is solved🎉`);
						}, 1500);
					}
					forwardIndex++;
					if (forwardIndex >= 2) prevBtn.removeAttribute("disabled");
					else prevBtn.setAttribute("disabled", "");
					i--; 
				} 
			}, delay * i);
		}
        nextMoveRef.current = nextMove;

		function repeatMove() {
			let async = false, repeat = true;
			let reverseStepIndex = props.movesAlgo.reverseAlgo.length - forwardIndex;
			applyMove(props.movesAlgo.reverseAlgo[reverseStepIndex], async);
			forwardIndex --;
			nextMove(repeat);
		}
		function previousMove() {
			let async = false, repeat = false;
			nextBtn.removeAttribute("disabled");
			replayBtn.classList.remove("active");
			cubePivot.classList.remove("active");
			let reverseStepIndex = props.movesAlgo.reverseAlgo.length - forwardIndex;
			applyMove(props.movesAlgo.reverseAlgo[reverseStepIndex], async);
			reverseStepIndex++;
			applyMove(props.movesAlgo.reverseAlgo[reverseStepIndex], async);
			forwardIndex -= 2;
			setCubeSolved(false);
			setMoveMessage(`Orient your cube as shown here to solve.`);
			setStepCount((prevCount) => prevCount - 2); 
			nextMove(repeat);
		}
        
		retryBtn.addEventListener("click", reScramble);
		prevBtn.addEventListener("click", previousMove);
		nextBtn.addEventListener("click", (e) => nextMove(false));
		repeatBtn.addEventListener("click", repeatMove);
		replayBtn.addEventListener("click", (e) => props.handleReplay());
		
        return () => {
             if(autoRunInterval.current) clearInterval(autoRunInterval.current);
             retryBtn.removeEventListener("click", reScramble);
             prevBtn.removeEventListener("click", previousMove);
             nextBtn.removeEventListener("click", (e) => nextMove(false));
             repeatBtn.removeEventListener("click", repeatMove);
             replayBtn.removeEventListener("click", (e) => props.handleReplay());
             forwardIndex = 0;
             reverseIndex = 0;
        }

    }, []);

    function handleAutoRun() {
        if(isAutoRunning) {
            clearInterval(autoRunInterval.current);
            setIsAutoRunning(false);
        } else {
            setIsAutoRunning(true);
            autoRunInterval.current = setInterval(() => {
                if(nextMoveRef.current) nextMoveRef.current(false);
            }, 800);
        }
    }

	return (
		<div className="cube__container">
			<div className="step__count flex__center--row">{`Step: ${stepCount}`}</div>
			<div className="move__name">{moveMessage}</div>
			<div className="moves__num">{`${props.movesAlgo.forwardAlgo.length} moves needed`}</div>
			<div className="scramble__error">Memory consumption is high. Please try again!</div>
			<button className="retry__btn--scramble">Retry</button>
			{cubeSolved && <Confetti/>}
			
            <div className="scene" id="scene">
                <div className="camera__view" style={{ transform: `rotateX(${cameraRotation.x}deg) rotateY(${cameraRotation.y}deg)` }}>
                    <div className="pivot centered" id="pivot" style={{ transform: "rotateX(0deg) rotateY(0deg) rotateZ(0deg)" }}>
                        <div className="cube" id="cube">
                            {Array.from({length: 26}).map((_, i) => (
                                <div className="piece" key={i}>
                                    <div className="element left"></div>
                                    <div className="element right"></div>
                                    <div className="element top"></div>
                                    <div className="element bottom"></div>
                                    <div className="element back"></div>
                                    <div className="element front"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
			</div>

			<div id="guide">
				<div className="anchor" id="anchor3" style={{ transform: "translateZ(3px) translateY(-33.33%) rotate(-270deg) translateY(66.67%)", }}></div>
				<div className="anchor" id="anchor2" style={{ transform: "translateZ(3px) translateY(-33.33%) rotate(-180deg) translateY(66.67%)", }}></div>
				<div className="anchor" id="anchor1" style={{ transform: "translateZ(3px) translateY(-33.33%) rotate(-90deg) translateY(66.67%)", }}></div>
				<div className="anchor" id="anchor0" style={{ transform: "translateZ(3px) translateY(-33.33%) rotate(0deg) translateY(66.67%)", }}></div>
			</div>

			<button className="previous__btn" disabled>Previous</button>
			<button className="repeat__btn" disabled>Repeat</button>
			<button className="next__move--btn" disabled>Next</button>
			<button className="replay__btn">Replay</button>
            
            {/* ĐÃ XOÁ PROP STYLE ĐỂ SỬ DỤNG CSS CLASS */}
            <button 
                className={`auto__run--btn ${isAutoRunning ? 'active' : ''}`}
                onClick={handleAutoRun}
            >
                {isAutoRunning ? "Stop Auto" : "Auto Run"}
            </button>
		</div>
	);
}

export default Solver;