# Amy Chen // amyjchen

## Demo Link
https://merunicorn.github.io/hw05-road-generation/

## External Resources
Adam's Kiluaea Lava code for Worley Noise & FBM functions

## Feature Explanation
Terrain Elevation
- I used Worley Noise and FBM to create a terrain-like look. I created boundaries for the return float value, where if it was below 0.3 I would draw water, if it was greater than 0.65 I would draw “snow” (or the lightest terrain color to indicate highest elevation), and mix the two colors with different amounts to get a more gradual look from low to high elevation.

Population Density
- I also used Worley Noise and FBM to create essentially randomly distributed circles, which represent population density. Drawing only where there was not water, I would color it dark if the return float was less than 0.5 (sparse population), and light if the return float was greater than 0.8 (dense population). For values in between, I mixed the colors with a value of 0.5 to get a color perfectly in-between to make the distinction a little more gradual.

Overlay
-  I pass in floats to my flat-frag.glsl that represent the booleans from the GUI, and draw certain colors based on those. Similarly, if the float for overlay (u_Overlay) is 1.0 (true), I set the color to be a mix between the elevation color and the population color, with the elevation color more heavily weighted.

L-Systems
- Using my base code from HW4, I edited the turtle, drawingrule, and expansionrule classes to better fit this assignment's needs. This included changing code such that the returning transformation matrix was a mat3 (since position/direction are all represented by vec2s). I also updated my drawingrule and expansionrule classes to take into account whether I was drawing a highway-type road or grid-type road, and set up the framework for branching.
- I also created a new class, NoiseFxns, which essentially translated all the GLSL Noise functions onto the CPU, to be used in CPU calculations based on noise, such as when roads determine branching based on population density.
