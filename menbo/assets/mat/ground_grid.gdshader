shader_type spatial;
render_mode unshaded, cull_disabled;

void fragment() {
	float c = mod(floor(WORLD_POSITION.x * 0.25) + floor(WORLD_POSITION.z * 0.25), 2.0);
	ALBEDO = mix(vec3(0.38, 0.34, 0.28), vec3(0.78, 0.72, 0.58), c);
}
