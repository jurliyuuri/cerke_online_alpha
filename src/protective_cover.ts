export type MembraneState = {
	protective_cover_over_field: boolean,
	protective_tam_cover_over_field: boolean,
	protective_cover_over_field_while_asyncawait: boolean,
	protective_cover_over_field_while_waiting_for_opponent: boolean,
}

const MEMBRANE_STATE: MembraneState
	= sessionStorage.getItem('membrane_state_backup')
		? JSON.parse(sessionStorage.membrane_state_backup) /* Reflecting this into DOM is done when "ty_zau" button is pressed */
		: {
			protective_cover_over_field: false,
			protective_tam_cover_over_field: false,
			protective_cover_over_field_while_asyncawait: false,
			protective_cover_over_field_while_waiting_for_opponent: true
		}
	;

export function apply_membrane_state_to_dom() {
	function apply(id:
		| "protective_cover_over_field"
		| "protective_tam_cover_over_field"
		| "protective_cover_over_field_while_asyncawait"
		| "protective_cover_over_field_while_waiting_for_opponent") {
		if (MEMBRANE_STATE[id]) {
			document.getElementById(id)?.classList.remove("nocover");
		} else {
			document.getElementById(id)?.classList.add("nocover");
		}
	}

	apply("protective_cover_over_field")
	apply("protective_tam_cover_over_field")
	apply("protective_cover_over_field_while_asyncawait")
	apply("protective_cover_over_field_while_waiting_for_opponent")
}

export function add_cover(id:
	| "protective_cover_over_field"
	| "protective_tam_cover_over_field"
	| "protective_cover_over_field_while_asyncawait"
	| "protective_cover_over_field_while_waiting_for_opponent") {
	document.getElementById(id)?.classList.remove("nocover");
	MEMBRANE_STATE[id] = true;
	sessionStorage.membrane_state_backup = JSON.stringify(MEMBRANE_STATE);
}

export function remove_cover(id:
	| "protective_cover_over_field"
	| "protective_tam_cover_over_field"
	| "protective_cover_over_field_while_asyncawait"
	| "protective_cover_over_field_while_waiting_for_opponent") {
	document.getElementById(id)?.classList.add("nocover");
	MEMBRANE_STATE[id] = false;
	sessionStorage.membrane_state_backup = JSON.stringify(MEMBRANE_STATE);
}