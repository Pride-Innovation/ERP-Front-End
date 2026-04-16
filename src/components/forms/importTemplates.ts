/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

/**
 * Maps module name → ordered column headers for the downloadable Excel import template.
 * Module names match the values from assetTypesStatusConstants and the "user" module.
 */
export const importTemplates: Record<string, string[]> = {
    user: ['No.', 'Name', 'Staff Number', 'Email', 'Title', 'Duty Station', 'Gender'],
    'IT Equipment': ['No.', 'Product Name', 'Asset Tag', 'Asset Serial No.', 'Model', 'USER', 'LOCATION', 'DATE OF PM/Verification'],
    'Office Equipment': ['No.', 'Product Name', 'Asset Tag', 'Asset Serial No.', 'Model', 'USER', 'LOCATION', 'DATE OF PM/Verification'],
    Fleet: ['No.', 'Product Name', 'Asset Tag', 'Asset Serial No.', 'Model', 'USER', 'LOCATION', 'DATE OF PM/Verification'],
};
