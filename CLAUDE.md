1. Repair Transfer

i. Engraved Number Field

- This field should behave like the other autocompletes. Look at the supplier Field on this page (http://localhost:3000/assets-mgt/inventory/create)
- Please notice that the autocomplete should not show any toast when the filtered or searched results are absent.

ii. Logistics.

- This will also be an autocomplete field just like the one discussed above. Please find the courier under the settings. It has also been used already in the movement initiated after request approvals. One is able to see a list of couriers both vetted and non vetted. 
- Please notice that the current holder of the asset will determine whether the asset will require a courier or not. That is from a branch to HO. Same location, there will be no need to involve a courier, tracking number, dispatch date and expected delivery since everything is within the same location.

NB: And I also hope that this will automatically go through the approval process. These approvals must be tracked and recorded. 

iii. Remarks.

- Optional field that will provide a brief description of the item damage. 


Please keep the styling intact, we just have to adjust the functionality. 


2. Temporary Replacement

i. Replacement. 

- This should show only items in the temporary asset pool. Please double check and see if the items listed here are and will only come from the temporary pool. This field should also be an autocomplete field.

ii. Recipient User

- This field should also be an auto complete field. so that users can be searched and filtered based on their names. Please double check the functionality.

iii. Logistics 

- This section is optional depending on whether the movement is within the head office or its to another branch.

iv. Remarks.

- This is also optional. 

3. Return After Repair

i. Repaired Asset.

- This should also be an autocomplete. 

ii. Destination.

- Once an asset is selected, this field should be auto-filled with the destination. This is because an asset under repair still has the assigned to user still tracked. Please double check that. This is to ensure that the asset is given to the right user after repair. So its better to have this field just for display and not editable. But the context should be clear.
 - The Reassign To Field should be changed to assigned to and should also be auto filled once the asset is selected. Not also editable.

I hope you understand that the Destination field and the New "Assigned To" fields do not need to be submitted in the DB since the asset already has a relationship with the user and the user also has a relationship with his branch. 

iii. Temporary Asset.

- This field is not necessary because we already have fields handling temporary assets. 

The Logistics and Remarks will remain as already described in the previous sections above. 


4. Disposal.

Please note that items in Bot IT and Admin Stores can be disposed off. But ofcourse they should not be new assets. In most cases they should be already having their useful lives exceeded. If you are able to also find out how an asset will be available for disposal depending on the calculating of its depreciation and useful life. 

NB. Please also provide a movement for this asset if its been disposed off from another branch and it must reach head office. 


Please do not alter the styling of these models they are already built to perfection according to the project requirements. The only challenge with these models is the buttons below, one is much bigger than the other and the look funny so please work on that. Other than that everything regarding styling is perfect.   



5. Movements.
- For Movements initiated after requests, there should be only one movement first of all. You mentioned that a movement is created from HO for example to a destination branch, then when the items reach the branch, another movement is created to the final requester. It would be much better to have a single movement but then I have a decision challenge here and I would like your opinion. This is a real work environment scenario, at one point, there can be only one item being transported from HO to another Branch or just items from one request, But in another scenario, there can be multiple items being transferred by a single courier and these items can be from different requests but to the same destination branch, what do you suggest would be the most ideal movement flow to achieve this. 


6. Manual Create.

- Please let me know with this manual create form. 

NB. Please just give me a plan for now, No code yet. Give me a solid plan and then we can write the code later. Regarding the above. 

7. Please let me also know how Temporary assets are differentiated from new Assets in the Store. 