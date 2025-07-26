# ProX Offline Page Requirements

## Introduction

This feature will create a dedicated "ProX offline" page that displays information about offline branches and shows a list of offline students. The page should have a modern, beautiful design optimized for desktop/laptop viewing and integrate seamlessly with the existing "proX offline" button functionality.

## Requirements

### Requirement 1

**User Story:** As a user, I want to see information about ProX offline branches when I click the "proX offline" button, so that I can learn about physical locations and offline learning opportunities.

#### Acceptance Criteria

1. WHEN user clicks "proX offline" button THEN system SHALL display the ProX offline page
2. WHEN ProX offline page loads THEN system SHALL show hero section with branch information text
3. WHEN ProX offline page loads THEN system SHALL display the text "ProX offline filiallariProX offline filiallarida zamonaviy va sifatli ta'lim, qulay joylashuv va do'stona muhit kutmoqda! Barcha offline o'quvchilar ro'yxati quyida keltirilgan."

### Requirement 2

**User Story:** As a user, I want to see a list of offline students, so that I can understand the community and scale of offline education.

#### Acceptance Criteria

1. WHEN ProX offline page loads THEN system SHALL fetch and display list of offline students
2. WHEN displaying offline students THEN system SHALL show student names and relevant information
3. IF no offline students exist THEN system SHALL show appropriate empty state message

### Requirement 3

**User Story:** As a user, I want the ProX offline page to have a modern and beautiful design on desktop/laptop, so that I have an engaging visual experience.

#### Acceptance Criteria

1. WHEN viewing on desktop/laptop THEN system SHALL display modern hero section design
2. WHEN viewing on desktop/laptop THEN system SHALL use appropriate typography, spacing, and visual hierarchy
3. WHEN viewing on desktop/laptop THEN system SHALL maintain consistency with existing design system
4. WHEN viewing on desktop/laptop THEN system SHALL include appropriate animations and transitions

### Requirement 4

**User Story:** As a user, I want the ProX offline page to be responsive, so that I can access it from different devices.

#### Acceptance Criteria

1. WHEN viewing on mobile devices THEN system SHALL adapt layout appropriately
2. WHEN viewing on tablet devices THEN system SHALL maintain readability and usability
3. WHEN viewing on different screen sizes THEN system SHALL preserve visual hierarchy and functionality

### Requirement 5

**User Story:** As a user, I want to see bad days statistics for students, so that I can understand their performance patterns over time.

#### Acceptance Criteria

1. WHEN viewing student details THEN system SHALL remove the chart legend section
2. WHEN viewing student details THEN system SHALL calculate weekly bad days count (days with score < 7)
3. WHEN viewing student details THEN system SHALL calculate monthly bad days count (days with score < 7)
4. WHEN viewing student details THEN system SHALL display "Haftalik yomon kunlar soni" statistic
5. WHEN viewing student details THEN system SHALL display "Oylik yomon kunlar soni" statistic