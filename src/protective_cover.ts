export type MembraneState = {
	protective_cover_over_field: boolean,
	protective_tam_cover_over_field: boolean,
	protective_cover_over_field_while_asyncawait: boolean,
	protective_cover_over_field_while_waiting_for_opponent: boolean,
}

const MEMBRANE_STATE: MembraneState
	= localStorage.getItem('membrane_state_backup')
		? apply_to_dom_and_return(JSON.parse(localStorage.membrane_state_backup))
		: {
			protective_cover_over_field: false,
			protective_tam_cover_over_field: false,
			protective_cover_over_field_while_asyncawait: false,
			protective_cover_over_field_while_waiting_for_opponent: true
		}
	;

function apply_to_dom_and_return(m: MembraneState) {
	if (m["protective_cover_over_field"]) { add_cover("protective_cover_over_field") } else { remove_cover("protective_cover_over_field") }
	if (m["protective_tam_cover_over_field"]) { add_cover("protective_tam_cover_over_field") } else { remove_cover("protective_tam_cover_over_field") }
	if (m["protective_cover_over_field_while_asyncawait"]) { add_cover("protective_cover_over_field_while_asyncawait") } else { remove_cover("protective_cover_over_field_while_asyncawait") }
	if (m["protective_cover_over_field_while_waiting_for_opponent"]) { add_cover("protective_cover_over_field_while_waiting_for_opponent") } else { remove_cover("protective_cover_over_field_while_waiting_for_opponent") }
	return m;
}

export function add_cover(id:
	| "protective_cover_over_field"
	| "protective_tam_cover_over_field"
	| "protective_cover_over_field_while_asyncawait"
	| "protective_cover_over_field_while_waiting_for_opponent") {
	document.getElementById(id)?.classList.remove("nocover");
	MEMBRANE_STATE[id] = true;
	localStorage.membrane_state_backup = JSON.stringify(MEMBRANE_STATE);
}

export function remove_cover(id:
	| "protective_cover_over_field"
	| "protective_tam_cover_over_field"
	| "protective_cover_over_field_while_asyncawait"
	| "protective_cover_over_field_while_waiting_for_opponent") {
	document.getElementById(id)?.classList.add("nocover");
	MEMBRANE_STATE[id] = false;
	localStorage.membrane_state_backup = JSON.stringify(MEMBRANE_STATE);
}