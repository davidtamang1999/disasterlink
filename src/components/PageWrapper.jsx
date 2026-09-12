const PageWrapper = ({ children }) => {
  return (
    <div className="animate-fadeIn">
      {children}
    </div>
  );
};

export default PageWrapper;