Implement an “Auctionable Only” filter in Admin Panel → Top 10, matching the exact behavior already used on the Players page, without modifying anything unrelated.

Core Requirements
Add an Auctionable Only toggle/filter to Admin Panel Top 10.
Reuse the same filtering logic and UX pattern from the Players page.
Ensure OVR filters (Min OVR + Max OVR) sync perfectly with Auctionable Only:
If Auctionable Only = ON → show only auctionable players.
If Auctionable Only = ON + Min OVR = 100 → show only auctionable players with OVR ≥ 100.
If Auctionable Only = ON + Max OVR = 110 → show only auctionable players with OVR ≤ 110.
If Auctionable Only = ON + Min OVR + Max OVR → all conditions must apply together.
If Auctionable Only = OFF → behavior remains unchanged (all players filtered only by OVR if set).
Do not change any unrelated Admin Panel Top 10 functionality, layout, or existing filters.
Implementation Guidance
Inspect the Players page filter implementation.
Copy/reuse:
state management
query params / API params
backend filtering logic
frontend toggle behavior
Keep code consistent with existing architecture.
Avoid duplicate logic where possible.
Testing Requirements (Mandatory)

Perform full testing to verify:

Functional Cases
Auctionable OFF + no OVR → all players
Auctionable ON + no OVR → only auctionable
Auctionable ON + Min OVR only
Auctionable ON + Max OVR only
Auctionable ON + Min + Max
Auctionable OFF + Min + Max
Edge cases:
No auctionable players in range
Exact boundary values
Invalid min/max combinations
Playwright Testing

Use Playwright (optional but preferred) to:

Toggle Auctionable Only
Set Min/Max OVR
Verify returned list always matches filters
Confirm no non-auctionable player appears when toggle is ON
Confirm OVR constraints always apply correctly
Success Criteria
Zero regression
Filter logic identical to Players page
Admin Panel Top 10 filters are perfectly synchronized
Clean code
Fully tested and production-safe
Final Deliverables
Feature implementation
Filter sync validation
Full test coverage
Playwright E2E verification (if possible)