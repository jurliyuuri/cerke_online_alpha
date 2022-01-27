export function add_cover(id:
	| "protective_cover_over_field"
	| "protective_tam_cover_over_field"
	| "protective_cover_over_field_while_asyncawait"
	| "protective_cover_over_field_while_waiting_for_opponent") {
	document.getElementById(id)?.classList.remove("nocover");
}

export function remove_cover(id:
	| "protective_cover_over_field"
	| "protective_tam_cover_over_field"
	| "protective_cover_over_field_while_asyncawait"
	| "protective_cover_over_field_while_waiting_for_opponent") {
	document.getElementById(id)?.classList.add("nocover");
}