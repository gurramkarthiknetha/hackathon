import { motion } from "framer-motion";
import { Code, Users, Target, Award, Github, Linkedin, Twitter } from "lucide-react";
import { useSidebar } from "../../components/dashboard/DashboardLayout";

const AboutPage = () => {
  const { sidebarOpen } = useSidebar();
  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "Full Stack Developer",
      image: "AJ",
      bio: "Passionate about creating innovative solutions and leading development teams.",
      social: { github: "#", linkedin: "#", twitter: "#" }
    },
    {
      name: "Sarah Chen",
      role: "UI/UX Designer",
      image: "SC",
      bio: "Focused on creating beautiful and intuitive user experiences.",
      social: { github: "#", linkedin: "#", twitter: "#" }
    },
    {
      name: "Mike Rodriguez",
      role: "Backend Developer",
      image: "MR",
      bio: "Expert in scalable backend systems and database optimization.",
      social: { github: "#", linkedin: "#", twitter: "#" }
    },
    {
      name: "Emily Davis",
      role: "Product Manager",
      image: "ED",
      bio: "Bridging the gap between technical implementation and user needs.",
      social: { github: "#", linkedin: "#", twitter: "#" }
    }
  ];

  const features = [
    {
      icon: Code,
      title: "Modern Technology Stack",
      description: "Built with React, Node.js, and modern web technologies for optimal performance.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      title: "Collaborative Platform",
      description: "Designed to facilitate teamwork and collaboration in hackathon environments.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Target,
      title: "Goal-Oriented",
      description: "Focused on helping teams achieve their hackathon objectives efficiently.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Award,
      title: "Award-Winning Design",
      description: "Recognized for excellence in user experience and innovative features.",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const stats = [
    { label: "Projects Completed", value: "150+" },
    { label: "Active Users", value: "2.5K+" },
    { label: "Team Members", value: "12" },
    { label: "Countries", value: "25+" }
  ];

  return (
    <div className={`space-y-8 ${sidebarOpen ? 'p-4 lg:p-6' : 'p-4 lg:p-8 xl:px-12'}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text mb-4">
          About Our Project
        </h1>
        <p className="text-gray-300 text-lg max-w-3xl mx-auto">
          We're a passionate team of developers, designers, and innovators dedicated to creating 
          exceptional hackathon experiences through cutting-edge technology and collaborative tools.
        </p>
      </motion.div>

      {/* Mission Statement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-8 border border-gray-800"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-gray-300 text-lg leading-relaxed max-w-4xl mx-auto">
            To empower hackathon participants with intuitive, powerful tools that streamline project 
            management, enhance collaboration, and accelerate innovation. We believe that great ideas 
            deserve great execution, and our platform is designed to make that possible.
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800 text-center"
          >
            <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text mb-2">
              {stat.value}
            </div>
            <div className="text-gray-300 text-sm">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-white text-center mb-8">What Makes Us Special</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} flex-shrink-0`}>
                  <feature.icon size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Team */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-white text-center mb-8">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800 text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                {member.image}
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
              <p className="text-green-400 text-sm mb-3">{member.role}</p>
              <p className="text-gray-300 text-sm mb-4">{member.bio}</p>
              
              <div className="flex justify-center space-x-3">
                <a
                  href={member.social.github}
                  className="p-2 bg-gray-800 bg-opacity-50 rounded-lg text-gray-400 hover:text-white hover:bg-opacity-70 transition-all duration-200"
                >
                  <Github size={16} />
                </a>
                <a
                  href={member.social.linkedin}
                  className="p-2 bg-gray-800 bg-opacity-50 rounded-lg text-gray-400 hover:text-white hover:bg-opacity-70 transition-all duration-200"
                >
                  <Linkedin size={16} />
                </a>
                <a
                  href={member.social.twitter}
                  className="p-2 bg-gray-800 bg-opacity-50 rounded-lg text-gray-400 hover:text-white hover:bg-opacity-70 transition-all duration-200"
                >
                  <Twitter size={16} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-8 text-center"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
        <p className="text-white text-opacity-90 mb-6 max-w-2xl mx-auto">
          Join thousands of developers and teams who are already using our platform to build 
          amazing projects and win hackathons.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-6 py-3 bg-white text-green-600 font-bold rounded-lg hover:bg-gray-100 transition-colors duration-200">
            Start Your Project
          </button>
          <button className="px-6 py-3 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-green-600 transition-all duration-200">
            Learn More
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutPage;
