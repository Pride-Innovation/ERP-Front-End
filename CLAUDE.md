Widgets are controlled by permissions.

2. The mechanism.
- I like the whole idea of the dashboard, but don't you think dashboards should be having a totally different sets of permissions.
- An officer may have a permission to view assets or read assets, since he or she may need to access the assets routes and view his assets. How will the dashboard resolve this? will he only be able to see only assets records assigned to him on the dashboard, and if that is so, do you determine the user role, and then further filter based on his role what he sees, because even a BOM may need to see his reports, and reports for the entire branch, and this may also be the case for the BM. Please show me a brief structure on how the records are being filtered based on the user role and work station.

3. The page, top to bottom.
- When I log in a Super Admin, I see  "All branches & Head Office" as expected.
- But when i log in a BOM, BM or a Branch user, i should be able to see the branch name, but instead its showing  "Your records". Please also double check the icon being rendered.
- Please double check if the bands of  Total Assets · In Use · In Store · In Repair render the data accordingly. How is Head office data rendered, and how are branches data rendered, which permissions guard this and which roles are supposed to see this. 

4. Every widget

Work Queue
- Open Request. -> What does it mean when you say an open request? Let us say an officer makes a request, this request is open to the Requester until the approval processes (even movement if necessary) are completed until the asset finally reaches the requester. Is that how its implemented? Please look that this very carefully and also show movements if necessary.
- Open Request. -> This shows on the dashboard of the current approver, and disappears when the current approver has approved the request. Is that the case?
- Please also double check that the total open requests are rendered accordingly to the correct users and also in the correct Branches. 
- Please also double check the flags implementation also in the backend.

My Assets.
- Please just double check the functionality of the assets assigned to me also in the backend. And also for the drop down, please improve the styling of the assets table like the striped table for reports page and also add some clean designs if necessary to improve the listings of assets assigned to me. Each row should be clickable to go to the assets view details page. 

My Requests (My Open Requests). 
- Please double check the data that is being displayed on this section. When an officer makes a request an his immediate supervisor approves, the request should still be visible in this section through out all the approval steps and even movements if there. It should only disappear when the requested item has reached the user. please confirm that. 

Assets by Category
- Please double check the functionality of this and please also let me know what the HO super admin sees and also what the BM and the BOM sees. Does the Super admin see the general report for HO and all other branches and do BM and BOM only see their Branches related information. 

Asset Conditions.
- Please also double check this functionality and clearly state it for me.

Assets Across All Branches
- Please check in the settings and confirm that this permission can be assigned to a role.


Stocking Trend.

- This section completely seems to render wrongly. The categrories lists are not rendering our categories but legacy data. Please double check and please ensure that the graphs is loading accordingly.
- Please let me know how the values loads for head office, and for branches. I would also suggest that there is also a branch selection that enables admins in head office to select a particular branch to see the reports per branch, and then they should be able to see overall also. This should per branch filter should also be applied to the Positions section.  

Request Fullfilment.
- Request Fulfillment should also borrow the approach for Stocking Trend where i can see per branch, and also overall if i am admin in HO. But branches only see for their branches. Please double the functionality first and let me know how it stands for now. 


Records.
- What is the plan for the Records section that you mentioned that it has no widgets. I need this also implemented and properly functional. 


5. What each user group actually sees
- I highly recommend that apart from the seeders, these permissions must be visible in the roles and permissions section in settings so that some of the permissions can given to other roles also or in a better way to do this. Because there may never be a store keeper but the permissions may be assigned to head office administrators.  

Note:  One of the main reasons why i need you to thoroughly think about dashboard permissions separately is also that you are assuming that the Super Admin should be the only one seeing some of these messages. But to clarify to you is that the dashboard can really get so complicated based of the requirement. A normal officer may not see all these reports and only see things associated with him or her. But there is an admin officer, who should ideally have the visibility to see even reports from other branches and even head office, since admins are suppose to ideally manage this app. They should have visibility to a lot of things in this app and even view all issuance stages of a requests, assets across all branches and so many other information. This makes its a bit complicated. Please note that admins can also make requests and they also have managers. Then there is also another important unit of infra. Its the reason i have created the admin unit and infra unit to distinguish whether a user is an officer but then from Admin unit or Infra unit. Please note that this very important.  
