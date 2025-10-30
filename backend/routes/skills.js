const express = require("express");
const { body, validationResult } = require("express-validator");
const { getUser, updateUser } = require("../config/firebase");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Predefined skill categories and skills
const SKILL_CATEGORIES = {
  "Programming & Tech": [
    "JavaScript",
    "Python",
    "Java",
    "C++",
    "C#",
    "Go",
    "Rust",
    "PHP",
    "Ruby",
    "Swift",
    "Kotlin",
    "TypeScript",
    "React",
    "Vue.js",
    "Angular",
    "Node.js",
    "Express.js",
    "Django",
    "Flask",
    "Spring Boot",
    "Laravel",
    "Ruby on Rails",
    "HTML",
    "CSS",
    "Sass",
    "Bootstrap",
    "Tailwind CSS",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Redis",
    "Firebase",
    "AWS",
    "Azure",
    "Google Cloud",
    "Docker",
    "Kubernetes",
    "Git",
    "GitHub",
    "GitLab",
    "CI/CD",
    "DevOps",
  ],
  "Design & Creative": [
    "UI/UX Design",
    "Graphic Design",
    "Logo Design",
    "Brand Identity",
    "Adobe Photoshop",
    "Adobe Illustrator",
    "Adobe InDesign",
    "Figma",
    "Sketch",
    "Wireframing",
    "Prototyping",
    "User Research",
    "Design Thinking",
    "Photography",
    "Videography",
    "Video Editing",
    "Motion Graphics",
    "3D Modeling",
    "Blender",
    "Maya",
    "Cinema 4D",
    "SketchUp",
    "Interior Design",
    "Architecture",
    "Landscape Design",
  ],
  Languages: [
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Russian",
    "Chinese",
    "Japanese",
    "Korean",
    "Arabic",
    "Hindi",
    "Dutch",
    "Swedish",
    "Norwegian",
    "Danish",
    "Polish",
    "Turkish",
  ],
  "Business & Finance": [
    "Business Analysis",
    "Project Management",
    "Product Management",
    "Marketing",
    "Digital Marketing",
    "SEO",
    "Social Media Marketing",
    "Content Marketing",
    "Email Marketing",
    "Google Ads",
    "Facebook Ads",
    "Sales",
    "Customer Service",
    "Human Resources",
    "Recruitment",
    "Accounting",
    "Finance",
    "Investment",
    "Cryptocurrency",
    "Entrepreneurship",
    "Leadership",
    "Team Management",
  ],
  "Writing & Communication": [
    "Copywriting",
    "Content Writing",
    "Technical Writing",
    "Creative Writing",
    "Blogging",
    "Journalism",
    "Screenwriting",
    "Script Writing",
    "Public Speaking",
    "Presentation Skills",
    "Negotiation",
    "Translation",
    "Proofreading",
    "Editing",
    "Copy Editing",
  ],
  "Science & Math": [
    "Mathematics",
    "Statistics",
    "Physics",
    "Chemistry",
    "Biology",
    "Data Science",
    "Machine Learning",
    "Artificial Intelligence",
    "Research Methods",
    "Scientific Writing",
    "Laboratory Techniques",
  ],
  "Music & Arts": [
    "Piano",
    "Guitar",
    "Violin",
    "Drums",
    "Singing",
    "Music Theory",
    "Music Production",
    "DAW Software",
    "Logic Pro",
    "Pro Tools",
    "Songwriting",
    "Composition",
    "Music Recording",
  ],
  "Lifestyle & Personal": [
    "Cooking",
    "Baking",
    "Nutrition",
    "Fitness",
    "Yoga",
    "Meditation",
    "Personal Development",
    "Life Coaching",
    "Time Management",
    "Study Skills",
    "Learning Techniques",
    "Memory Improvement",
  ],
  Other: [
    "Gardening",
    "Woodworking",
    "Sewing",
    "Knitting",
    "Pottery",
    "Automotive Repair",
    "Plumbing",
    "Electrical Work",
    "Carpentry",
  ],
};

// Get all available skill categories
router.get("/categories", async (req, res) => {
  try {
    res.json({
      categories: SKILL_CATEGORIES,
    });
  } catch (error) {
    console.error("Get skill categories error:", error);
    res.status(500).json({
      error: "Failed to get skill categories",
    });
  }
});

// Search skills across categories
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        error: "Search query must be at least 2 characters",
      });
    }

    const searchResults = [];
    const queryLower = query.toLowerCase();

    // Search through all categories
    for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
      const matchingSkills = skills.filter((skill) =>
        skill.toLowerCase().includes(queryLower)
      );

      if (matchingSkills.length > 0) {
        searchResults.push({
          category,
          skills: matchingSkills,
        });
      }
    }

    res.json({
      query,
      results: searchResults,
      totalMatches: searchResults.reduce(
        (acc, curr) => acc + curr.skills.length,
        0
      ),
    });
  } catch (error) {
    console.error("Search skills error:", error);
    res.status(500).json({
      error: "Failed to search skills",
    });
  }
});

// Get user's skills
router.get("/my-skills", verifyToken, async (req, res) => {
  try {
    const user = await getUser(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      skills: {
        teachable: user.skills?.teachable || [],
        desired: user.skills?.desired || [],
      },
    });
  } catch (error) {
    console.error("Get user skills error:", error);
    res.status(500).json({
      error: "Failed to get user skills",
    });
  }
});

// Add teachable skills
router.post(
  "/teachable",
  verifyToken,
  [
    body("skills")
      .isArray()
      .withMessage("Skills must be an array")
      .custom((skills) => {
        if (skills.length === 0) {
          throw new Error("At least one skill must be provided");
        }
        if (skills.length > 10) {
          throw new Error("Maximum 10 teachable skills allowed");
        }
        return true;
      }),
    body("skills.*")
      .isString()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Each skill must be 2-50 characters long"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { skills } = req.body;

      // Allow all skills (predefined or custom)
      // Just ensure they're not empty after trimming
      const validSkills = skills.filter(
        (skill) => skill && skill.trim().length >= 2
      );

      if (validSkills.length === 0) {
        return res.status(400).json({
          error:
            "No valid skills provided. Skills must be at least 2 characters long.",
        });
      }

      // Get current user
      const user = await getUser(req.user.id);
      const currentSkills = user.skills || { teachable: [], desired: [] };
      const currentTeachable = currentSkills.teachable || [];

      // Merge and deduplicate skills
      const updatedTeachable = [
        ...new Set([...currentTeachable, ...validSkills]),
      ];

      // Update user skills
      await updateUser(req.user.id, {
        skills: {
          ...currentSkills,
          teachable: updatedTeachable,
        },
      });

      res.json({
        message: "Teachable skills added successfully",
        skills: updatedTeachable,
        added: validSkills,
      });
    } catch (error) {
      console.error("Add teachable skills error:", error);
      res.status(500).json({
        error: "Failed to add teachable skills",
      });
    }
  }
);

// Add desired skills
router.post(
  "/desired",
  verifyToken,
  [
    body("skills")
      .isArray()
      .withMessage("Skills must be an array")
      .custom((skills) => {
        if (skills.length === 0) {
          throw new Error("At least one skill must be provided");
        }
        if (skills.length > 10) {
          throw new Error("Maximum 10 desired skills allowed");
        }
        return true;
      }),
    body("skills.*")
      .isString()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Each skill must be 2-50 characters long"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { skills } = req.body;

      // Allow all skills (predefined or custom)
      // Just ensure they're not empty after trimming
      const validSkills = skills.filter(
        (skill) => skill && skill.trim().length >= 2
      );

      if (validSkills.length === 0) {
        return res.status(400).json({
          error:
            "No valid skills provided. Skills must be at least 2 characters long.",
        });
      }

      // Get current user
      const user = await getUser(req.user.id);
      const currentSkills = user.skills || { teachable: [], desired: [] };
      const currentDesired = currentSkills.desired || [];

      // Merge and deduplicate skills
      const updatedDesired = [...new Set([...currentDesired, ...validSkills])];

      // Update user skills
      await updateUser(req.user.id, {
        skills: {
          ...currentSkills,
          desired: updatedDesired,
        },
      });

      res.json({
        message: "Desired skills added successfully",
        skills: updatedDesired,
        added: validSkills,
      });
    } catch (error) {
      console.error("Add desired skills error:", error);
      res.status(500).json({
        error: "Failed to add desired skills",
      });
    }
  }
);

// Remove teachable skill
router.delete("/teachable/:skill", verifyToken, async (req, res) => {
  try {
    const { skill } = req.params;

    const user = await getUser(req.user.id);
    const currentSkills = user.skills || { teachable: [], desired: [] };
    const currentTeachable = currentSkills.teachable || [];

    // Remove skill if it exists
    const updatedTeachable = currentTeachable.filter((s) => s !== skill);

    if (updatedTeachable.length === currentTeachable.length) {
      return res.status(404).json({
        error: "Skill not found in teachable skills",
      });
    }

    await updateUser(req.user.id, {
      skills: {
        ...currentSkills,
        teachable: updatedTeachable,
      },
    });

    res.json({
      message: "Skill removed successfully",
      skills: updatedTeachable,
    });
  } catch (error) {
    console.error("Remove teachable skill error:", error);
    res.status(500).json({
      error: "Failed to remove teachable skill",
    });
  }
});

// Remove desired skill
router.delete("/desired/:skill", verifyToken, async (req, res) => {
  try {
    const { skill } = req.params;

    const user = await getUser(req.user.id);
    const currentSkills = user.skills || { teachable: [], desired: [] };
    const currentDesired = currentSkills.desired || [];

    // Remove skill if it exists
    const updatedDesired = currentDesired.filter((s) => s !== skill);

    if (updatedDesired.length === currentDesired.length) {
      return res.status(404).json({
        error: "Skill not found in desired skills",
      });
    }

    await updateUser(req.user.id, {
      skills: {
        ...currentSkills,
        desired: updatedDesired,
      },
    });

    res.json({
      message: "Skill removed successfully",
      skills: updatedDesired,
    });
  } catch (error) {
    console.error("Remove desired skill error:", error);
    res.status(500).json({
      error: "Failed to remove desired skill",
    });
  }
});

// Update skill proficiency level (for future enhancement)
router.put(
  "/proficiency",
  verifyToken,
  [
    body("skill").isString().trim().notEmpty(),
    body("level")
      .isIn(["beginner", "intermediate", "advanced", "expert"])
      .withMessage(
        "Level must be one of: beginner, intermediate, advanced, expert"
      ),
    body("type")
      .isIn(["teachable", "desired"])
      .withMessage("Type must be either teachable or desired"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { skill, level, type } = req.body;

      // Get current user
      const user = await getUser(req.user.id);

      // For now, we'll just store the basic skill without proficiency level
      // This endpoint is prepared for future enhancement

      res.json({
        message: "Skill proficiency feature coming soon",
        skill,
        level,
        type,
      });
    } catch (error) {
      console.error("Update skill proficiency error:", error);
      res.status(500).json({
        error: "Failed to update skill proficiency",
      });
    }
  }
);

// Get skill recommendations for user
router.get("/recommendations", verifyToken, async (req, res) => {
  try {
    const user = await getUser(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const userTeachable = user.skills?.teachable || [];
    const userDesired = user.skills?.desired || [];

    // Simple recommendation algorithm
    // In a real app, this would use more sophisticated ML algorithms
    const recommendations = [];

    // Get skills that match user's teachable skills
    for (const teachableSkill of userTeachable) {
      for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
        if (skills.includes(teachableSkill)) {
          // Add related skills from the same category
          const relatedSkills = skills
            .filter((s) => s !== teachableSkill && !userDesired.includes(s))
            .slice(0, 3);

          recommendations.push(...relatedSkills);
        }
      }
    }

    // Remove duplicates and skills user already has
    const uniqueRecommendations = [...new Set(recommendations)]
      .filter(
        (skill) =>
          !userDesired.includes(skill) && !userTeachable.includes(skill)
      )
      .slice(0, 10);

    res.json({
      recommendations: uniqueRecommendations,
      basedOn: userTeachable,
      userHasDesired: userDesired,
    });
  } catch (error) {
    console.error("Get skill recommendations error:", error);
    res.status(500).json({
      error: "Failed to get skill recommendations",
    });
  }
});

module.exports = router;
