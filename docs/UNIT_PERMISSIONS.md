Phase A — Delete the dead endpoint (smallest, unblocks the rest)
- Remove /latest-pending-request, findLatestPendingRequestsWithDetails, determineStatusIds, and the REPORT_PENDING_REQUESTS constant + its security matcher. Nothing calls them.
- Please confirm again that its not being used anywhere again before proceeding to delete them. Instead of deleting them I would recommend you to comment them instead. 


Phase B — Unit roles: the model.

- Does this mean that a unit will have a set of roles that can be invoked and also removed? 
- What if a user does not have a unit what happens? 
- Do we have to manually specify the API calls that will also consider unit roles?  

Please clarify how this will then work across the app.


Phase C — Settings: manage unit roles

- I agree with this section and it makes a lot of sense.


Phase D — Retire the legacy request model

- You mentioned that "Once units carry permissions, delete determineUserRole, legacyRequestersList and the three gates; requestersList keeps only the explicit-scope ladder". Please explain how the current functionality works and explain all the methods you would love to retire after giving permissions to units. I would still would recommend commenting the methods instead of removing them incase we have to role back.

- I need you to explain for me these functionalities (Sequenced last on purpose. Those gates are the only thing currently giving Admin/BOM cross-branch request visibility. Removing them before unit roles exist would narrow real users. Phase B must land and be configured first.) and how the Phase B would resolve it. And please note that were it requires seeding of permissions, please add a flyway file to seed the permissions automatically. And finally just comment where necessary to enable roll back.  

Phase E — Dashboard

- Wire it into the scope label so a viewer can see why their reach is what it is.

Phase F — Verification
- Please write the test cases.


Part 3 — Questions

1. Does a unit role grant the same permissions everywhere, or does it need a scope of its own?

- It will definitely need a scope since not all API calls will need unit permissions. 
- This should be configurable. Please let me know if its configurable. 
- View Assets API call can be configured to use the unit permissions so that the permissions will be applied. 
- I also need to know what happens to users that do not have units since units are optional and for users that belong to other units other than Infra and Admin.
- And please in the plan you have for Phase B, where roles are defined, does it mean each unit can have its own permissions, for example, Does it mean Infra unit can have different permissions from Admin Unit on the same API so that we can control what each unit sees. These permissions may be scoped based on Asset location, category and so on regarding the properties of an asset if we are calling the Asset API. 

2. Should DASH_SCOPE_ALL on an Admin officer widen asset actions too, or only visibility?
- You mentioned this (Today scope governs what you see summarised; READ_ASSET governs the register. If an Admin officer should create, update and delete assets in a branch, that's CREATE_/UPDATE_/DELETE_ASSET — but nothing currently stops a branch officer with those permissions from editing another branch's asset either. There is no branch check on asset writes at all.). First of all Branches should be scoped to view only their data by default so even if another branch user has those permissions, he should not be able to view other branches information. But there is an exception for the two units of Admin and Infra from head office (HO) that can be granted this visibility and these actions to view or update these information from other branches. Other than that, other branches should only be able to view their data and perform the other actions on the branch items if they have the permissions. 

3. The normal-officer case needs a decision.
- Please go with your recommendation as long as he gets only assets assigned to him. 

4. Are Admin and Infra peers?
- I have highlighted this in the first question so that we can signed different permissions based on the API so that each unit can have the same or different permissions. Please let me know if this make any sense

5. Does a unit role apply outside Head Office?
- No units are only set in head office. A branch user will never be in admin or infra unit. 

6. Precedence when sources disagree. 
-  I'd also default to widest wins




UPDATED QUESTIONS.


Phase A
- Lets go with your recommendation. Please go ahead and delete it if its safe to delete them instead of commenting them. 

Q1 — the design fork

1. Design A — unit roles join the permission union. 
- You mentioned that (A unit role granting READ_ASSET means the holder has READ_ASSET, full stop — identical to being granted it by title or additional role. No endpoint knows or cares where a permission came from.). This makes a lot of sense and its very technically correct. But then can we also have permissions like view other branches assets so that a unit officer can view other branches asset, or even another permissions for a user to view another asset categories and so on? but like you suggested we can still start with branches only. This should be configurable at a unit level. Then also besides an officer just viewing his assets, may there should be options to view other peoples assets in HO and branches if they belonging to a unit regardless of their roles as officers or managers.


2. Design B — unit permissions apply only to nominated endpoints.
- This is your quote (READ_ASSET from your unit works on /assets but not on /export/assets, say.) which is somehow correct, since permission is a union, what i meant that the unit permissions will not be applied to some endpoints but it will be applied to others. first think of this scenario where we are listing assets (which also uses unit permission for example), this should allow admin officers to view other branches assets, and normal officers to only view their assets. But in another scenario, we may have requests api that lists all requests, this should only admin users to view their requests and requests appending their inputs. What do you think would be the best approach to achieve this? It will not be only READ_ASSET permission only, because a normal officer may also have the READ_ASSET or READ_REQUEST permission, but there should be also another permission that allows a user to see other things and to differentiate them.
- You mentioned that ( Under B it becomes a function of user and endpoint — you could no longer answer "what can Jane do?" without also asking "where?"), but think of that as another Permission given to a unit with will also resolve to a true of false. For example let us say a user does not belong to any of the admin and infra units for example, it should then just resolve to false, then the functionality remains as it currently is. A user may also belong to those units and the unit may not have that permission to retrieve those records and it will still resolve to false. Please let me know if its feasible though. 
- you also mentioned that (And I don't think you need it, because of what you wrote in Q2). Data being scoped per branch is ok, and every branch user should be able to see only his branch data, except the two units of admin and infra in head office. But think of a request initiated from another Branch it should only be visible to admin after the approval steps have been completed and is now pending an admin approval or input. So not every branch activities will be visible to admin but may be visible at some points while others are always visible to admin. 

- You also mentioned that ( You configure it by choosing which roles a unit carries, and which permissions those roles hold.). Of course you can create new roles and add them in different units and assign them permissions which is OK, but please also notice that there are other roles that may be in admin, infra and also in other units. Please notice that all the current roles apply to all units and even none units so i hope  you mean creating a totally different roles and giving to admin and infra units. 

- you also mentioned that you can't absorb this (The one part I can't absorb into this: you also wrote "These permissions may be scoped based on Asset location, category and so on regarding the properties of an asset."). Based on the previous statement you stated clearly that you would create different roles and assign them to infra and Admin units for example. Let us say you cave created a role called MANAGE_ASSETS, then there should be permissions under it like view_all_branches_assets, update_all_branches_assets and so on. Does this make any sense. So that means it will depend on whether an admin officer can view branches assets, delete them, update them and so on, so that when a normal officer only sees his and admin sees also for other branches. Please ignore the category section. Lets leave the category scoping for later as you suggested. its only branch scoping for now. 

you also mentioned that (So a branch officer with UPDATE_ASSET can already edit another branch's asset by id — they just can't find it through the listing. That's the real hole behind your Q2, and it isn't a unit problem; it's a missing check on writes. I'd add it as its own phase.) Not every user should be able to edit. For example, I may give the role officer an UPDATE_ASSET permission, if the officer is in a branch, then he can edit the asset, but if the officer is in head office he can edit the asset only if he is an Admin. In most cases an officer may not even be able to have the UPDATE_ASSET Permission because the officers are not expected to edit assets details. But an officer being in an Admin unit will be able to edit asset in both branches in HO because the unit has a Role that has a permission to edit assets. Please let me know if this makes any sense. Then you can also have UPDATE_REQUEST that may be assigned to all officers then a normal officer can update his own requests only and not any other request. In some case you can also have officers in admin unit to update other people's request or even delete them, if permission is granted to officers in that unit. 

Regarding your questions on 

Two things I'd like settled before I write code
1. Lets us go with your recommendation
2. I need this piece of work. 