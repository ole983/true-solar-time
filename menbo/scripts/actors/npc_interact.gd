extends CharacterBody3D

const GRAVITY := 12.0
const NEAR_RANGE := 4.5
const SPEAK_RANGE := 3.2
const WALK_SPEED := 2.2
const OPEN_WALK_SPEED := 9.0
const ARRIVE := 0.45
const HOLD_SEC := 3.0
const DRINK_PAUSE_SEC := 2.0
const OPEN_DELAY_SEC := 0.6
const LOOK_SEC := 5.0
const CUT_IN_REFUSE_CHANCE := 0.4
# 正式规则：没回话等待半日。竖切用 20 秒，避免验收空等。
const WAIT_SEC := 20.0
const REQUEST_LINE := "请求：帮把手去饮水"
const FIRST_LINE := "来喝一口？"

enum State { IDLE, WAITING, ACTING }
enum Act { NONE, DRINK_WALK, DRINK_STAND, HOLD, APPROACH }

@export var npc_id := "井边"
@export var enable_opening := true
@export var capsule_color := Color(0.86, 0.58, 0.42, 1)

var _state: State = State.IDLE
var _act: Act = Act.NONE
var _player_near := false
var _wait_left := 0.0
var _hold_left := 0.0
var _open_delay_left := OPEN_DELAY_SEC
var _opening_pending := true
var _opening_done := false
var _harbor_unlocked := false
var _look_left := 0.0
var _claimed_matter := ""
var _job_stand := Vector3.ZERO
var _job_stay_left := 0.0
var _well_stand := Vector3.ZERO

@onready var _ui: CanvasLayer = $RequestUI
@onready var _request_btn: Button = $RequestUI/Root/RequestButton
@onready var _opening_line: Label = $RequestUI/Root/OpeningLine
@onready var _reply_row: HBoxContainer = $RequestUI/Root/ReplyRow
@onready var _accept_btn: Button = $RequestUI/Root/ReplyRow/AcceptButton
@onready var _refuse_btn: Button = $RequestUI/Root/ReplyRow/RefuseButton
@onready var _wait_btn: Button = $RequestUI/Root/ReplyRow/WaitButton


func _ready() -> void:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = capsule_color
	$MeshInstance3D.material_override = mat
	_ui.hide()
	_request_btn.show()
	_opening_line.hide()
	_reply_row.hide()
	_well_stand = _find_well_stand()
	_request_btn.pressed.connect(_on_request_pressed)
	_accept_btn.pressed.connect(_on_accept_pressed)
	_refuse_btn.pressed.connect(_on_refuse_pressed)
	_wait_btn.pressed.connect(_on_wait_a_bit_pressed)
	var area := $InteractArea as Area3D
	area.monitoring = true
	area.collision_layer = 4
	area.collision_mask = 2
	_state = State.IDLE
	if enable_opening:
		_look_left = 1.0
	else:
		_opening_pending = false
		_opening_done = true
		_harbor_unlocked = true
		_look_left = _stagger_look()


func _exit_tree() -> void:
	_drop_job()


func _process(_delta: float) -> void:
	if _ui.visible:
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE


func _input(event: InputEvent) -> void:
	if _state != State.IDLE:
		return
	if _reply_row.visible:
		return
	if not _is_interact_pressed(event):
		return
	if not _player_near:
		return
	if _opening_done:
		_show_request_button()
	else:
		_begin_first_ask()
	get_viewport().set_input_as_handled()


func _physics_process(delta: float) -> void:
	if _opening_pending:
		_tick_opening_delay(delta)
	match _state:
		State.IDLE:
			_tick_idle(delta)
		State.WAITING:
			_tick_waiting(delta)
		State.ACTING:
			_tick_acting(delta)
	_refresh_near()


func _tick_opening_delay(delta: float) -> void:
	_open_delay_left -= delta
	if _open_delay_left > 0.0:
		return
	_opening_pending = false
	if _close_enough_to_speak():
		_begin_first_ask()
		return
	_state = State.ACTING
	_act = Act.APPROACH


func _tick_idle(delta: float) -> void:
	# 含拒绝之后：必须继续走。禁止 get_tree().paused。不征召全港。
	if not _harbor_unlocked:
		_stand_but_move(delta)
		return
	if _claimed_matter == "":
		_look_left -= delta
		_stand_but_move(delta)
		if _look_left <= 0.0:
			_look_left = LOOK_SEC + randf() * 2.5
			_try_claim()
		return
	if _walk_toward(_job_stand, delta, WALK_SPEED):
		_job_stay_left -= delta
		if _job_stay_left <= 0.0:
			_drop_job()
			_look_left = 1.2 + randf() * 2.0


func _tick_waiting(delta: float) -> void:
	_wait_left -= delta
	_stand_but_move(delta)
	if _wait_left <= 0.0:
		_no_reply()


func _tick_acting(delta: float) -> void:
	match _act:
		Act.APPROACH:
			_tick_approach(delta)
		Act.DRINK_WALK:
			if _walk_toward(_well_stand, delta, WALK_SPEED):
				_act = Act.DRINK_STAND
				_hold_left = DRINK_PAUSE_SEC
		Act.DRINK_STAND:
			_stand_but_move(delta)
			_hold_left -= delta
			if _hold_left <= 0.0:
				_resume_idle()
		Act.HOLD:
			_stand_but_move(delta)
			_hold_left -= delta
			if _hold_left <= 0.0:
				_resume_idle()
		_:
			_resume_idle()


func _tick_approach(delta: float) -> void:
	var player := _get_player()
	if player == null:
		_unlock_harbor()
		_resume_idle()
		return
	if _horizontal_distance(player) <= SPEAK_RANGE:
		_begin_first_ask()
		return
	var dest := player.global_position
	dest.y = global_position.y
	_walk_toward(dest, delta, OPEN_WALK_SPEED)


func _try_claim() -> void:
	var free: Array[String] = HarborBoard.free_matters()
	if free.is_empty():
		return
	free.shuffle()
	var matter := free[0]
	if not HarborBoard.claim(npc_id, matter):
		return
	_claimed_matter = matter
	_job_stand = HarborBoard.stand_position(matter, global_position.y)
	_job_stay_left = 5.5 + randf() * 4.0


func _drop_job() -> void:
	if _claimed_matter == "":
		return
	HarborBoard.release(npc_id)
	_claimed_matter = ""


func _stagger_look() -> float:
	match npc_id:
		"井边":
			return 3.0
		"阿渡":
			return 5.5
		_:
			return 7.0


func _unlock_harbor() -> void:
	_harbor_unlocked = true
	_opening_done = true
	if _look_left < 0.8:
		_look_left = 0.8


func _walk_toward(target: Vector3, delta: float, speed: float) -> bool:
	if not is_on_floor():
		velocity.y -= GRAVITY * delta
	var to := target - global_position
	to.y = 0.0
	if to.length() <= ARRIVE:
		velocity.x = 0.0
		velocity.z = 0.0
		move_and_slide()
		return true
	var dir := to.normalized()
	velocity.x = dir.x * speed
	velocity.z = dir.z * speed
	if dir.length() > 0.01:
		look_at(global_position + dir, Vector3.UP)
	move_and_slide()
	return false


func _stand_but_move(delta: float) -> void:
	if not is_on_floor():
		velocity.y -= GRAVITY * delta
	velocity.x = 0.0
	velocity.z = 0.0
	move_and_slide()


func _arrived(target: Vector3) -> bool:
	var d := target - global_position
	d.y = 0.0
	return d.length() <= ARRIVE


func _find_well_stand() -> Vector3:
	var well := get_tree().get_first_node_in_group("well")
	if well is Node3D:
		var p: Vector3 = well.global_position
		return Vector3(p.x, global_position.y, p.z + 2.15)
	return global_position + Vector3(-1.8, 0.0, 0.8)


func _get_player() -> Node3D:
	var nodes := get_tree().get_nodes_in_group("player")
	if nodes.is_empty():
		return null
	return nodes[0] as Node3D


func _close_enough_to_speak() -> bool:
	var player := _get_player()
	return player != null and _horizontal_distance(player) <= SPEAK_RANGE


func _refresh_near() -> void:
	var near := false
	for node in get_tree().get_nodes_in_group("player"):
		if node is Node3D and _horizontal_distance(node) <= NEAR_RANGE:
			near = true
			break
	_player_near = near
	if _player_near:
		return
	if _state == State.WAITING:
		_no_reply()
	elif _ui.visible and _state == State.IDLE:
		_close_ui()


func _horizontal_distance(other: Node3D) -> float:
	var a := Vector2(global_position.x, global_position.z)
	var b := Vector2(other.global_position.x, other.global_position.z)
	return a.distance_to(b)


func _is_interact_pressed(event: InputEvent) -> bool:
	if event.is_action_pressed("interact"):
		return true
	if event is InputEventKey and event.pressed and not event.echo:
		return event.keycode == KEY_E or event.physical_keycode == KEY_E
	return false


func _begin_first_ask() -> void:
	if _state == State.WAITING:
		return
	print(FIRST_LINE)
	add_to_group("request_open")
	_opening_line.text = FIRST_LINE
	_opening_line.show()
	_request_btn.hide()
	_reply_row.show()
	_ui.visible = true
	_ui.show()
	_state = State.WAITING
	_wait_left = WAIT_SEC
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE


func _show_request_button() -> void:
	add_to_group("request_open")
	_opening_line.hide()
	_request_btn.show()
	_reply_row.hide()
	_ui.visible = true
	_ui.show()
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE


func _close_ui() -> void:
	if not _ui.visible:
		return
	remove_from_group("request_open")
	_request_btn.show()
	_opening_line.hide()
	_reply_row.hide()
	_ui.hide()
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED


func _on_request_pressed() -> void:
	print(REQUEST_LINE)
	# 插队：只问眼前这一个人。忙着认领的事时可能拒绝，世界不停。
	if _claimed_matter != "" and randf() < CUT_IN_REFUSE_CHANCE:
		_close_ui()
		_resume_job_motion()
		return
	_request_btn.hide()
	_opening_line.hide()
	_reply_row.show()
	_state = State.WAITING
	_wait_left = WAIT_SEC
	add_to_group("request_open")
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE


func _on_accept_pressed() -> void:
	_unlock_harbor()
	_drop_job()
	_close_ui()
	if enable_opening:
		_state = State.ACTING
		_act = Act.DRINK_WALK
	else:
		_state = State.ACTING
		_act = Act.HOLD
		_hold_left = 2.0


func _on_refuse_pressed() -> void:
	# 拒绝：立刻回到港事。无失败界面。世界不暂停。
	_unlock_harbor()
	_close_ui()
	_state = State.IDLE
	_resume_job_motion()


func _on_wait_a_bit_pressed() -> void:
	_unlock_harbor()
	_close_ui()
	_state = State.ACTING
	_act = Act.HOLD
	_hold_left = HOLD_SEC


func _no_reply() -> void:
	_unlock_harbor()
	_close_ui()
	_resume_idle()


func _resume_idle() -> void:
	_act = Act.NONE
	_state = State.IDLE


func _resume_job_motion() -> void:
	var dt := get_physics_process_delta_time()
	if _claimed_matter != "":
		_walk_toward(_job_stand, dt, WALK_SPEED)
		return
	_stand_but_move(dt)
	_try_claim()
	if _claimed_matter != "":
		_walk_toward(_job_stand, dt, WALK_SPEED)
