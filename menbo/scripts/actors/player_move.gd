extends CharacterBody3D

const SPEED := 4.5
const GRAVITY := 12.0
const MOUSE_SENS := 0.0022
const PITCH_MIN := deg_to_rad(-40.0)
const PITCH_MAX := deg_to_rad(28.0)
const ARM_HEIGHT := 0.7
const ARM_LENGTH := 3.9
const SHOULDER := 1.85
const LOOK_H_OFFSET := 0.0

@onready var _cam_pivot: Node3D = $CamPivot
@onready var _spring: SpringArm3D = $CamPivot/SpringArm3D
@onready var _camera: Camera3D = $CamPivot/SpringArm3D/Camera3D


func _ready() -> void:
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	add_to_group("player")
	collision_layer = 2
	collision_mask = 1
	_cam_pivot.position = Vector3(0.0, ARM_HEIGHT, 0.0)
	_cam_pivot.rotation_degrees.x = 8.0
	# SpringArm 沿 +Z 拉子节点。玩家前方是 -Z，所以 +Z 正好在背后。
	_spring.position = Vector3(SHOULDER, 0.0, 0.0)
	_spring.rotation = Vector3.ZERO
	_spring.spring_length = ARM_LENGTH
	_spring.margin = 0.2
	_spring.collision_mask = 0
	_spring.add_excluded_object(get_rid())
	_camera.rotation = Vector3.ZERO
	_camera.h_offset = LOOK_H_OFFSET
	_camera.current = true


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"):
		if Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
			Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
		else:
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
		get_viewport().set_input_as_handled()
		return
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		if not get_tree().get_nodes_in_group("request_open").is_empty():
			return
		if Input.mouse_mode != Input.MOUSE_MODE_CAPTURED:
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
			get_viewport().set_input_as_handled()
		return
	if Input.mouse_mode != Input.MOUSE_MODE_CAPTURED:
		return
	if event is InputEventMouseMotion:
		rotate_y(-event.relative.x * MOUSE_SENS)
		_cam_pivot.rotate_x(-event.relative.y * MOUSE_SENS)
		_cam_pivot.rotation.x = clampf(_cam_pivot.rotation.x, PITCH_MIN, PITCH_MAX)


func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity.y -= GRAVITY * delta
	var v := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	var dir := (transform.basis * Vector3(v.x, 0.0, v.y)).normalized()
	if dir != Vector3.ZERO:
		velocity.x = dir.x * SPEED
		velocity.z = dir.z * SPEED
	else:
		velocity.x = move_toward(velocity.x, 0.0, SPEED)
		velocity.z = move_toward(velocity.z, 0.0, SPEED)
	move_and_slide()
