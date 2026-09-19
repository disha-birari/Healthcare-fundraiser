// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MediTrustCrowdfunding
 * @notice Transparent healthcare crowdfunding registry with milestone escrow release & hospital verification
 */
contract MediTrustCrowdfunding {
    struct Milestone {
        string description;       // e.g. "Hospital Admission Deposit (30%)"
        uint256 payoutPercent;    // Percentage of total raised (30 = 30%, 40 = 40%)
        bool isReleased;          // Has this tranche been claimed/released
    }

    struct Campaign {
        address payable recipient;   // Address receiving the funds (hospital/patient)
        uint256 targetAmount;       // Funding target in Wei (1 ETH = 10^18 Wei)
        uint256 raisedAmount;       // Total funds raised in Wei
        uint256 deadline;           // Expiry time (Unix timestamp)
        string ipfsHash;            // IPFS hash pointing to medical documents and story metadata
        bool isHospitalVerified;    // Approved by authorized hospital audit
        bool isClaimed;             // Have all funds been fully claimed
        uint8 currentMilestoneStep; // Current milestone step (0: Admission, 1: Procedure, 2: Discharge)
    }

    address public owner;
    uint256 public campaignCount;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public donations; // campaignId => donorAddress => amount
    mapping(uint256 => Milestone[3]) public campaignMilestones;

    event CampaignCreated(
        uint256 indexed campaignId, 
        address indexed recipient, 
        uint256 targetAmount, 
        uint256 deadline, 
        string ipfsHash
    );
    event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event CampaignVerified(uint256 indexed campaignId);
    event MilestoneReleased(uint256 indexed campaignId, uint8 milestoneStep, uint256 payoutAmount);
    event FundsClaimed(uint256 indexed campaignId, address indexed recipient, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can execute this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Create a new on-chain crowdfunding campaign with default 3-tranche milestone escrow
     */
    function createCampaign(
        address payable _recipient,
        uint256 _targetAmount,
        uint256 _durationInDays,
        string memory _ipfsHash
    ) external returns (uint256) {
        require(_targetAmount > 0, "Target amount must be greater than zero");

        campaignCount++;
        uint256 campaignId = campaignCount;

        campaigns[campaignId] = Campaign({
            recipient: _recipient,
            targetAmount: _targetAmount,
            raisedAmount: 0,
            deadline: block.timestamp + (_durationInDays * 1 days),
            ipfsHash: _ipfsHash,
            isHospitalVerified: false,
            isClaimed: false,
            currentMilestoneStep: 0
        });

        // Initialize 3-tranche milestone structure
        campaignMilestones[campaignId][0] = Milestone("Initial Hospital Admission Deposit", 30, false);
        campaignMilestones[campaignId][1] = Milestone("Surgical Procedure & Therapy Execution", 40, false);
        campaignMilestones[campaignId][2] = Milestone("Post-Op Recovery & Discharge Settlement", 30, false);

        emit CampaignCreated(campaignId, _recipient, _targetAmount, block.timestamp + (_durationInDays * 1 days), _ipfsHash);
        return campaignId;
    }

    /**
     * @notice Donate Native gas token (ETH) to a campaign
     */
    function donateToCampaign(uint256 _campaignId) external payable {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp < campaign.deadline, "Campaign has expired");
        require(msg.value > 0, "Donation must be greater than zero");
        require(!campaign.isClaimed, "Campaign funds have already been fully claimed");

        campaign.raisedAmount += msg.value;
        donations[_campaignId][msg.sender] += msg.value;

        emit DonationReceived(_campaignId, msg.sender, msg.value);
    }

    /**
     * @notice Verify a medical campaign (triggered by trusted hospital entity or contract owner)
     */
    function verifyCampaign(uint256 _campaignId) external onlyOwner {
        Campaign storage campaign = campaigns[_campaignId];
        campaign.isHospitalVerified = true;
        emit CampaignVerified(_campaignId);
    }

    /**
     * @notice Release funds by milestone tranche directly to hospital recipient
     */
    function releaseMilestoneTranche(uint256 _campaignId, uint8 _step) external onlyOwner {
        require(_step < 3, "Invalid milestone step");
        Campaign storage campaign = campaigns[_campaignId];
        Milestone storage milestone = campaignMilestones[_campaignId][_step];

        require(campaign.isHospitalVerified, "Campaign must be hospital-verified before milestone release");
        require(!milestone.isReleased, "Milestone tranche already released");

        uint256 payoutAmount = (campaign.raisedAmount * milestone.payoutPercent) / 100;
        milestone.isReleased = true;
        campaign.currentMilestoneStep = _step + 1;

        if (campaign.currentMilestoneStep >= 3) {
            campaign.isClaimed = true;
        }

        campaign.recipient.transfer(payoutAmount);
        emit MilestoneReleased(_campaignId, _step, payoutAmount);
    }

    /**
     * @notice Claim remaining funds for the designated campaign upon expiry or target completion
     */
    function claimFunds(uint256 _campaignId) external {
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == campaign.recipient || msg.sender == owner, "Unauthorized claim caller");
        require(block.timestamp >= campaign.deadline || campaign.raisedAmount >= campaign.targetAmount, "Funding period active");
        require(!campaign.isClaimed, "Funds have already been fully claimed");

        uint256 totalPayout = campaign.raisedAmount;
        campaign.isClaimed = true;
        campaign.recipient.transfer(totalPayout);

        emit FundsClaimed(_campaignId, campaign.recipient, totalPayout);
    }
}

