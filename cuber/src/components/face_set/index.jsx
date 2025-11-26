import React, { useState, useEffect } from 'react'
import solver from "rubiks-cube-solver";			
import "./style.css"
import { nanoid } from "nanoid"

export default function FaceSet(props) {
    let [activeColor, setActiveColor] = useState("green");
    // State for cube rotation view
    let [rotation, setRotation] = useState({ x: -30, y: -45 });
    
    // Mouse dragging logic for rotating the cube view
    useEffect(() => {
        let isDragging = false;
        let startX, startY;
        const sensitivity = 0.5;

        const handleMouseDown = (e) => {
            // Only rotate if not clicking on a sticker (optional, but good UX)
            // But user might want to rotate even starting from a sticker.
            // Let's allow rotation if they drag.
            if(e.target.closest('.color__set--btn') || e.target.closest('.palette__item')) return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
        };

        const handleMouseMove = (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            setRotation(prev => ({
                x: prev.x - deltaY * sensitivity,
                y: prev.y + deltaX * sensitivity
            }));

            startX = e.clientX;
            startY = e.clientY;
        };

        const handleMouseUp = () => {
            isDragging = false;
        };

        const scene = document.querySelector('.face__set--section');
        if(scene) {
            scene.addEventListener('mousedown', handleMouseDown);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            if(scene) scene.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
    }, []);


    function solveCube() {
        // ... (Keep existing conversion logic)
        function color_to_side(colors) {
            let sideValue = colors.map((color) => {
                let result = "f";
                switch (color) {
                    case "green": result = "f"; break;
                    case "red": result = "r"; break;
                    case "white": result = "u"; break;
                    case "yellow": result = "d"; break;
                    case "orange": result = "l"; break;
                    case "blue": result = "b"; break;
                    default: break;
                }
                return result;
            });
            return sideValue;
        }

        let frontFace = color_to_side(props.cubeColorState.front).join("");
        let rightFace = color_to_side(props.cubeColorState.right).join("");
        let upperFace = color_to_side(props.cubeColorState.upper).join("");
        let downFace = color_to_side(props.cubeColorState.down).join("");
        let leftFace = color_to_side(props.cubeColorState.left).join("");
        let backFace = color_to_side(props.cubeColorState.back).join("");

        let cubeState = [frontFace, rightFace, upperFace, downFace, leftFace, backFace].join("");
        
        try {
            let solveMoves = solver(cubeState).split(" ");
            let reverseMoves = solveMoves.map((move) => {
                if(move.includes("2")) return move;
                else if(move.includes("prime")) return move.replace("prime", "");
                else return (move + "prime");
            }).reverse();

            props.setAlgo({solveMoves, reverseMoves});
            props.handleClick();
        } catch (error) {
            alert("Invalid Cube State! Please check colors.");
        }
	}

    // Generate stickers for a face
    const renderFace = (faceName, colors) => {
        return colors.map((color, index) => (
            <div 
                key={`${faceName}-${index}`} 
                className={`face3d__sticker ${color}`}
                onClick={(e) => {
                    e.stopPropagation(); // Prevent drag start if just clicking
                    props.updateFaceColor(faceName, index, activeColor);
                }}
            >
                {index === 4 && <span className="center-dot"></span>}
            </div>
        ));
    };

    // New: reset handler to restore standard cube colors
    function handleReset(e) {
        e?.stopPropagation();
        const defaults = {
            front: Array(9).fill('green'),
            right: Array(9).fill('red'),
            upper: Array(9).fill('white'),
            down: Array(9).fill('yellow'),
            left: Array(9).fill('orange'),
            back: Array(9).fill('blue')
        };
        // Update every sticker via provided updater
        Object.entries(defaults).forEach(([face, arr]) => {
            arr.forEach((color, idx) => props.updateFaceColor(face, idx, color));
        });
        setActiveColor('green'); // optional: reset selected color
    }

    return (
        <div className="face__set--section flex__center--col">
            <div className="face__set--title">Set Cube Colors</div>
            <div className="instructions">Select a color below, then click on the cube faces. Drag background to rotate.</div>

            {/* Color Palette */}
            <div className="palette flex__center--row">
                {['green', 'red', 'white', 'yellow', 'orange', 'blue'].map(c => (
                    <div 
                        key={c}
                        className={`palette__item ${c} ${activeColor === c ? 'active' : ''}`}
                        onClick={() => setActiveColor(c)}
                    ></div>
                ))}
            </div>

            {/* 3D Cube Container */}
            <div className="cube3d__container">
                <div className="scene3d">
                    <div className="pivot3d" style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}>
                        {/* Front Face */}
                        <div className="face3d front">
                            {renderFace("front", props.colors.front)}
                        </div>
                        {/* Back Face */}
                        <div className="face3d back">
                            {renderFace("back", props.colors.back)}
                        </div>
                        {/* Right Face */}
                        <div className="face3d right">
                            {renderFace("right", props.colors.right)}
                        </div>
                        {/* Left Face */}
                        <div className="face3d left">
                            {renderFace("left", props.colors.left)}
                        </div>
                        {/* Top (Upper) Face */}
                        <div className="face3d top">
                            {renderFace("upper", props.colors.upper)}
                        </div>
                        {/* Bottom (Down) Face */}
                        <div className="face3d bottom">
                            {renderFace("down", props.colors.down)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="controls flex__center--row">
                <button className="scramble__btn" onClick={props.onScramble}>Scramble Rubik</button>
                <button className="color__set--btn" onClick={solveCube}>Solve</button>
                {/* New reset button */}
                <button className="reset__btn" onClick={handleReset}>Reset</button>
            </div>
        </div>
    );
}