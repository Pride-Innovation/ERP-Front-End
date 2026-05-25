These are the core models of the Application. That is Assets, Requests, Inventory and Store. They are very closely related to Each Other. 

This is the expected funtionality.


Request

When a user (officer) makes a request from the request model, his or her manager should approve or reject this request. A request can be totally rejected or a request could be rejected asking the user to make some adjustments to this request. when a user creates a request his manager should be notified. Please note that his manager is also a system user so he can go on leave and when he is onleave he can assign an acting manager to handle requests from officers. Whether the manager is present or not, an email will be sent to the managers group email for that specific department. Please not that each department can have multiple units each unit headed by a manager and they have an email group. That means if an officers makes a request, the email is sent to his immediate manager and also to the manager's group email for that specific branch. This is ensure that any other manager can also handle this request. This is how the notifications work. there is the email notification and there should also be notification sent via socket. there is a notification bell at the navbar section which should show a logged in user his nofitications. Please create a page for users to view their notifications. Notifications are done on both rejections and approvals. 

After a manager has approved or recommended the request, the head of department will be notified both by email and also the webscoket. He should also recommend the request or reject the request. Once he rejects the requests, he can provide the details of what needs to be adjusted or just rejects the request without any feedback. Both the manager who approved this request previously and the officer will be notified of this rejection. An email should also be sent to the manager's group. If the request requires any improvement, then the officer will make the necessary adjustments and send the request again through his manager who will approve or reject. then it goes to the head of department. Once the head of department approves this request the correct unit is notified. So there are two units involved here that is the Infrastructure Unit and Admin Unit. The approval from the Head of department will go to the Admin Unit if the Asset Category is to be handled by Admin. It will go to Infrastructure unit group email if the Asset category is to be handled by Infrastructure Team. One Admin or Infrastructure Team or Admin Team have recieved this email in their Unit group email, Each officer from that unit can work on this request. The first thing they should do is to acknowledege the receipt of this request.

Please note that every user who performs any of this actions must be tracked. 


Once an officer from Admin or Infrastructure acknowledge this request, the requester must be notified that his request is now at the Admin. 

Then Comes the Inventory.

Inventory.

This section is done by Admin Unit Or the Infratructure Unit People. But it would be better if this can be customizable.

so for example an aadmin user logs in and stocks the items that are requested. please note that requests can be from many users so that admin will stock all the items in the requests and please also see how the good recieved notes are being handled. There are also scenarios of partial delivery of the requested stock items and also the numbers that have been delivered. In some scenarios not all the requested stock items are delivered and the system must be in possition to properly handle that scenario. The Admin also must generate a good received note for the items delivered by the supplier aand the supplier must sign this good received notes. This signed good recieved notes must then be uploaded in the system for tracking purposes. 
So when the items are stocked, the must be created automatically as assets in the system. For Example there is alogic that will create four Computers in Asset Model if four computers are stocked. Please remember that at stocking, only a few information about an item is taking to speed up the stocking process. So once 4 laptops have been stocked, 4 assets will be created under the correct asset category for laptops. Please note that different items from different assets category can be stocked at once so pay very close attention to assets creation after stocking. Then there come the groups responsible for updating the rest of the information that may not have been taken during stocking. The unit responsible for this should also be customizable for example infrastructure can be responsible for Assets Categories that handle Computers, and furniture for admin. They should be notified that new stocks have come in, provide the details of the stocks and then send the email to their email group. 

There are three stores that are involved here. The admin store, the IT Store and the Disposal Store.

The admin store will be update once new stock comes in. Please look deep at the stores model and make adjustments where necessary. The other stores will be used for other things discussed below.

An admin or a user from Infratructure for example will then login and update the remaining details of each asset created one by one. Please notice that the asset will be now ready for issuance after the admin user or infratructure officer has updated the informaation including the engraved number. Once the new stock have been haved and status changed and engrave number provided. The item is now ready for issuance. 


The Admin then logs into the system and issues items based on the request created. Please note that an engravement number plays a very improtant role on an assets so while issuing assets for a particular request, the correct asset must be issued and this can be done by selecting the item with its engravement number. Also keep in mind that some items may not have engraement numbers but must also be issued. One an admin issues an item or items regardless of the category, there will be an approval by his or her immediate manager. Once the manager approves, the requester in this case will be notified that his or item is ready for picking. After picking the item he or she must acknowledge receipt and then the Admin store will be updated. Please look at the current implementation properly and see if everything talked about has been implemeted or if I have left out any step. 


The project requirement now needs this workflow to be customizable. completely cutomizable, that is each approver in this workflow should be customizbale. Because for branches, the workflow change, since there is now a Branch operational manager invlove and also a Branch manager involved and workflows also vary depending on the asset category. 


For the IT Store, That will be used to store assets under repair. Please look deeply in the assets model and you will notice repair is involved, but we will discuss the repair workflow later. The disposal store will handle aassets that are ready for disposal.