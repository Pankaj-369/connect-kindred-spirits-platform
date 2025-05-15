import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4">About Connect4Good</h1>
          <p className="text-center text-muted-foreground mb-8">
            Bridging the gap between volunteers, donors, and non-profit organizations
          </p>
          
          <div className="relative h-64 md:h-80 mb-12 rounded-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1559027615-cd4628902d4a" 
              alt="Team working together" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div className="p-6 text-white">
                <h2 className="text-2xl font-bold">Our Mission</h2>
                <p className="mt-2">
                  To create a world where help can be easily given and received
                </p>
              </div>
            </div>
          </div>
          
          <div className="prose max-w-none mb-12">
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="mb-4">
              Connect4Good was founded in 2023 with a simple but powerful vision: to create 
              a platform that makes it easy for people to find meaningful ways to give back 
              to their communities and for non-profit organizations to reach the volunteers 
              and donors they need.
            </p>
            <p className="mb-4">
              We believe that everyone has something valuable to contribute—whether it's time, 
              skills, or resources. Our platform is designed to remove the barriers that often 
              prevent people from getting involved with causes they care about.
            </p>
            <p className="mb-4">
              Since our launch, we've helped connect thousands of volunteers with organizations 
              doing important work in areas such as education, environmental conservation, 
              poverty alleviation, and more.
            </p>
          </div>
          
          <Separator className="my-12" />
          
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-muted p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">Accessibility</h3>
                <p className="text-muted-foreground">
                  We believe volunteering should be accessible to everyone, regardless of 
                  background or circumstances.
                </p>
              </div>
              <div className="bg-muted p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">Transparency</h3>
                <p className="text-muted-foreground">
                  We're committed to being transparent about our operations and the impact 
                  of our platform.
                </p>
              </div>
              <div className="bg-muted p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">Community</h3>
                <p className="text-muted-foreground">
                  We foster a sense of community among volunteers, donors, and non-profit 
                  organizations.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-6">Join Us Today</h2>
            <p className="mb-6">
              Whether you're looking to volunteer, donate, or are an organization seeking support, 
              Connect4Good is here to help you make a difference.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-connect-primary">
                Browse Opportunities
              </Button>
              <Button size="lg" variant="outline">
                Register Your NGO
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
