import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Button, Row, Col, Typography, Space, Badge } from 'antd';
import { 
  LoginOutlined, 
  VideoCameraOutlined, 
  MessageOutlined, 
  ShareAltOutlined,
  PhoneOutlined,
  ArrowRightOutlined,
  SmileFilled
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout className="min-h-screen bg-white">
      {/* --- LIGHT & MINIMAL HEADER --- */}
        <Header className="
          bg-white dark:bg-[#0f172a]
          sticky top-0 z-50
          px-6 md:px-20
          flex justify-between items-center
          h-20
          border-b border-gray-200 dark:border-gray-800
        ">
          {/* LOGO */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            {/* Icon box */}
            <div className="
              bg-indigo-600
              w-10 h-10
              rounded-xl
              flex items-center justify-center
            ">
              <SmileFilled className="text-white text-xl" />
            </div>

            {/* Text */}
            <span className="
              text-xl font-bold tracking-tight
              text-gray-900 dark:text-white
            ">
              besties<span className="text-indigo-600">.</span>
            </span>
          </div>

          {/* ACTIONS */}
          <Space size="large">
          

            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={() => navigate('/login')}
              className="
                h-10 px-6
                rounded-full
                bg-indigo-600
                hover:bg-indigo-700
                border-none
                font-semibold
                flex items-center
                shadow-sm
              "
            >
              Sign In
            </Button>
          </Space>
        </Header>



      <Content>
        {/* --- HERO SECTION --- */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
          <Row gutter={[48, 48]} align="middle">
            
            {/* Left Content */}
            <Col xs={24} lg={12}>
              <Badge 
                text="Live your best moments" 
                className="mb-4 px-3 py-1 bg-indigo-50 rounded-full text-[#7c73e6] font-bold text-[10px] uppercase tracking-widest"
              />
              
              <Title level={1} style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, color: '#1e1e38', marginBottom: '24px', letterSpacing: '-1px' }}>
                Dosti ka naya <br /> 
                <span className="text-[#7c73e6]">Thikana.</span>
              </Title>
              
              <Paragraph className="text-lg text-gray-400 mb-10 max-w-md leading-relaxed">
                Post share karein, doston se chat karein, aur high-quality video calls ka maza lein—sab kuch ek secure platform par.
              </Paragraph>
              
              <Space size="middle" className="flex flex-wrap">
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => navigate('/signup')}
                  className="h-14 px-8 rounded-2xl bg-[#7c73e6] border-none hover:bg-[#6a61cf] shadow-xl shadow-indigo-100 font-bold text-base"
                >
                  Join the Community <ArrowRightOutlined />
                </Button>
              </Space>

              {/* Social Proof */}
              <div className="mt-12 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="user" />
                    </div>
                  ))}
                </div>
                <Text className="text-gray-400 text-sm italic">Join 500+ besties today!</Text>
              </div>
            </Col>

            {/* Right Content: Feature Showcase */}
            <Col xs={24} lg={12}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FeatureBox 
                  icon={<MessageOutlined className="text-[#7c73e6]" />} 
                  title="Real-time Chat" 
                  desc="Messages with media sharing" 
                />
                <FeatureBox 
                  icon={<VideoCameraOutlined className="text-[#ff3b5c]" />} 
                  title="Video Calls" 
                  desc="Crystal clear 4K calls" 
                />
                <FeatureBox 
                  icon={<ShareAltOutlined className="text-emerald-500" />} 
                  title="Screen Share" 
                  desc="Share your screen instantly" 
                />
                <FeatureBox 
                  icon={<PhoneOutlined className="text-orange-500" />} 
                  title="Audio Calls" 
                  desc="High fidelity voice quality" 
                />
              </div>
            </Col>
          </Row>
        </div>
      </Content>
      
      {/* Footer Minimal */}
      <div className="py-10 text-center border-t border-gray-50">
         <Text className="text-gray-300">© 2025 Besties Social Project</Text>
      </div>
    </Layout>
  );
};

// Reusable Feature Box
const FeatureBox = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-8 bg-[#fafaff] rounded-4xl border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-2xl hover:shadow-indigo-100/40 transition-all duration-300 group">
    <div className="text-3xl mb-4 bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <Title level={4} style={{ fontSize: '18px', marginBottom: '8px' }}>{title}</Title>
    <Text className="text-gray-400 text-sm leading-relaxed">{desc}</Text>
  </div>
);

export default Home;