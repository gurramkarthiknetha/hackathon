import { motion } from "framer-motion";
import { Code, Users, Target, Github, Linkedin, Twitter, Zap, Shield, Globe, Heart } from "lucide-react";
import { useSidebar } from "../../components/layout/DashboardLayout";

const AboutPage = () => {
  const { sidebarOpen } = useSidebar();

  const features = [
    {
      icon: Zap,
      title: "Real-time Monitoring",
      description: "Advanced real-time monitoring system with live video feeds and instant alerts for emergency response.",
      color: "from-yellow-500 to-orange-600"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Enterprise-grade security with role-based access control and encrypted communications.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Scalable infrastructure designed to handle emergency response operations worldwide.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Seamless collaboration tools for administrators, operators, and first responders.",
      color: "from-purple-500 to-purple-600"
    }
  ];

  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "Lead Developer",
      description: "Full-stack developer with expertise in React, Node.js, and emergency response systems.",
      social: { github: "#", linkedin: "#", twitter: "#" }
    },
    {
      name: "Sarah Chen",
      role: "UI/UX Designer",
      description: "Creative designer focused on intuitive interfaces for high-stress emergency situations.",
      social: { github: "#", linkedin: "#", twitter: "#" }
    },
    {
      name: "Mike Rodriguez",
      role: "Backend Engineer",
      description: "Systems architect specializing in real-time data processing and scalable infrastructure.",
      social: { github: "#", linkedin: "#", twitter: "#" }
    },
    {
      name: "Emily Davis",
      role: "Product Manager",
      description: "Product strategist with background in emergency services and crisis management.",
      social: { github: "#", linkedin: "#", twitter: "#" }
    }
  ];

  const stats = [
    { label: "Active Users", value: "10,000+", color: "from-blue-500 to-blue-600" },
    { label: "Emergency Responses", value: "50,000+", color: "from-green-500 to-green-600" },
    { label: "Cities Covered", value: "200+", color: "from-purple-500 to-purple-600" },
    { label: "Response Time", value: "< 2 min", color: "from-orange-500 to-orange-600" }
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
          About Our Emergency Response Platform
        </h1>
        <p className="text-gray-300 text-lg max-w-3xl mx-auto">
          We're building the next generation of emergency response technology, connecting first responders,
          operators, and administrators through intelligent monitoring and rapid response coordination.
        </p>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800 text-center"
          >
            <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} text-transparent bg-clip-text mb-2`}>
              {stat.value}
            </div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Mission Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-8 border border-gray-800"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center">
            <Target className="mr-3 text-green-400" size={28} />
            Our Mission
          </h2>
          <p className="text-gray-300 text-lg max-w-4xl mx-auto">
            To revolutionize emergency response through innovative technology that saves lives, reduces response times,
            and empowers first responders with real-time intelligence and seamless coordination tools.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Save Lives</h3>
            <p className="text-gray-400">Every second counts in emergency situations. Our platform ensures rapid response and coordination.</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Real-time Intelligence</h3>
            <p className="text-gray-400">Live monitoring, instant alerts, and AI-powered insights for informed decision making.</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Seamless Coordination</h3>
            <p className="text-gray-400">Connect all stakeholders in the emergency response chain for maximum efficiency.</p>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Key Features</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} flex-shrink-0`}>
                  <feature.icon size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Team Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800 text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">{member.name.charAt(0)}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
              <p className="text-green-400 text-sm mb-3">{member.role}</p>
              <p className="text-gray-400 text-sm mb-4">{member.description}</p>

              <div className="flex justify-center space-x-3">
                <a href={member.social.github} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                  <Github size={16} className="text-gray-300 hover:text-white" />
                </a>
                <a href={member.social.linkedin} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                  <Linkedin size={16} className="text-gray-300 hover:text-white" />
                </a>
                <a href={member.social.twitter} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                  <Twitter size={16} className="text-gray-300 hover:text-white" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Technology Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-8 border border-gray-800"
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center">
          <Code className="mr-3 text-green-400" size={28} />
          Technology Stack
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Frontend</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-gray-300">React.js</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Tailwind CSS</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300">Framer Motion</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-gray-300">React Router</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Backend</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Node.js</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-gray-300">Express.js</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-gray-300">Socket.io</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-gray-300">MongoDB</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Infrastructure</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-gray-300">Docker</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-gray-300">AWS</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300">Kubernetes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Redis</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutPage;
