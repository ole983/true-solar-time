extends Node

## 港事板。NPC 自己认领空闲事项；玩家请求只插一个人的队，不是征召全港。

signal claimed(matter: String, who: String)
signal released(matter: String)

const MATTERS: PackedStringArray = [
	"修理",
	"迎接",
	"做饭",
	"看星门",
	"坐下来说",
	"休息",
]

# 认领者姓名；空字符串表示空闲。
var owners: Dictionary = {}


func _ready() -> void:
	for matter in MATTERS:
		owners[matter] = ""


func free_matters() -> Array[String]:
	var out: Array[String] = []
	for matter in MATTERS:
		if str(owners.get(matter, "")) == "":
			out.append(matter)
	return out


func claim(who: String, matter: String) -> bool:
	if who == "" or not owners.has(matter):
		return false
	if str(owners[matter]) != "":
		return false
	owners[matter] = who
	claimed.emit(matter, who)
	return true


func release(who: String) -> void:
	for matter in owners.keys():
		if str(owners[matter]) == who:
			owners[matter] = ""
			released.emit(matter)


func stand_position(matter: String, y: float) -> Vector3:
	var node: Node3D = null
	var offset := Vector3.ZERO
	match matter:
		"修理":
			node = _landmark("workshop")
			offset = Vector3(-2.6, 0.0, 0.0)
		"迎接":
			node = _landmark("gate")
			offset = Vector3(0.0, 0.0, 2.8)
		"做饭":
			node = _landmark("hearth")
			offset = Vector3(0.0, 0.0, -2.1)
		"看星门":
			node = _landmark("gate")
			offset = Vector3(3.2, 0.0, 0.4)
		"坐下来说":
			node = _landmark("table")
			offset = Vector3(0.0, 0.0, 2.5)
		"休息":
			node = _landmark("sleep")
			offset = Vector3(-2.5, 0.0, 0.0)
	if node == null:
		return Vector3(0.0, y, 0.0)
	var p: Vector3 = node.global_position
	return Vector3(p.x + offset.x, y, p.z + offset.z)


func _landmark(group_name: String) -> Node3D:
	var nodes := get_tree().get_nodes_in_group(group_name)
	if nodes.is_empty():
		return null
	return nodes[0] as Node3D
